const express = require('express');
const router = express.Router();

const Mentor = require('./mentor');
const Mentorado = require('./mentorado');

// Rotas para Mentores
router.post('/mentor', async (req, res) => {
    const mentor = new Mentor(req.body);
    await mentor.save();
    console.log(mentor);
    res.status(201).send(mentor);
});

// Rotas para Mentorados
router.post('/mentorado', async (req, res) => {
    const mentorado = new Mentorado(req.body);
    await mentorado.save();
    console.log(mentorado);
    res.status(201).send(mentorado);
});

// Rota para login
router.post('/login', async (req, res) => {
    const { nome, senha } = req.body;
    let usuario = await Mentor.findOne({ nome: nome, senha: senha }) || await Mentorado.findOne({ nome: nome, senha: senha });
    if (!usuario) {
        return res.status(404).send({ error: 'Usuário não encontrado ou senha incorreta' });
    }
    usuario = usuario.jsonify();
    res.status(200).send(usuario);});

// Rotas para o pareamento
router.get('/:id', async (req, res) => {
    const usuario = await Mentor.findById(req.params.id) || await Mentorado.findById(req.params.id);
    if (!usuario) {
        return res.status(404).send({ error: 'Usuário não encontrado' });
    }
    res.status(200).send(usuario.pareamento);
});

router.put('/pareamentos', async (req, res) => {
    if(!req.body.senha || req.body.senha !== process.env.SENHA_ADM) {
        return res.status(403).send({ error: 'Acesso negado' });
    }

    console.log("Iniciando pareamento...");
    const mentorados = await Mentorado.find().lean();
    const mentores = await Mentor.find().lean();

    const batchSize = 100;
    let mentoradoOps = [];
    let mentorOps = [];

    let relacaoPares = [];
        // Lógica de pareamento
    for (let mentorado of mentorados) {
        if(mentorado.pareamento && mentorado.pareamento != null) {
            console.log(`Mentorado ${mentorado.nome} já está pareado. Pulando...`);
            relacaoPares.push({ mentor: "previamente definido", mentorado: mentorado.nome });
            continue;
        }
        
        let melhorCompatibilidade = 0;
        let melhorMentor = null;
        for (let mentor of mentores) {
            const compat = compatibilidade(mentor, mentorado);
            console.log(`Compatibilidade entre Mentor ${mentor.nome} e Mentorado ${mentorado.nome}: ${compat}`);
            if (compat > melhorCompatibilidade) {
                melhorCompatibilidade = compat;
                melhorMentor = mentor;
            }
        }

        // Atualiza os registros de pareamento com bulkWrite
        if (melhorMentor) {

            mentoradoOps.push({
                updateOne: {
                    filter: { _id: mentorado._id },
                    update: { $set: { pareamento: melhorMentor._id } }
                }
            })
            mentorOps.push({
                updateOne: {
                    filter: { _id: melhorMentor._id },
                    update: { $push: { pareamento: mentorado._id } }
                }
            })
            relacaoPares.push({ mentor: melhorMentor.nome, mentorado: mentorado.nome });
            melhorMentor.pareamento.push(mentorado._id);

            console.log(`Mentorado ${mentorado.nome} pareado com Mentor ${melhorMentor.nome}`);

            if (mentoradoOps.length >= batchSize) {
                await Promise.all([
                    Mentorado.bulkWrite(mentoradoOps),
                    Mentor.bulkWrite(mentorOps)])
                mentoradoOps = [];
                mentorOps = [];
                console.log("Batch de " + batchSize + " pareamentos processado.");
            }

        } else {
            relacaoPares.push({ mentor: null, mentorado: mentorado.nome });
            console.log(`Nenhum mentor compatível encontrado para o mentorado ${mentorado.nome}`);
        }
    }
    
    if (mentoradoOps.length > 0) {
        await Promise.all([
            Mentorado.bulkWrite(mentoradoOps),
            Mentor.bulkWrite(mentorOps)
        ]);
        console.log("Batch final de pareamentos processado.");
    }

    console.log("Pareamento concluído!");
    res.send({ message: 'Pareamento concluído', pareamento: relacaoPares});
})

function compatibilidade(mentor, mentorado) {
    let valor = 0;
    // Verifica série
    if (mentor.serie < mentorado.serie || mentor.serie > mentorado.serie + 1) 
        return -1;
    // Verifica matérias
    for (let materia of mentorado.materias) {
        if (mentor.materias.includes(materia)) {
            valor += 1000;
        }
    }
        if (valor == 0) return -1;
    // Verifica ocupação do mentor
    valor -= mentor.pareamento.length * 100 || 0;
    // Verifica dias disponíveis
    for (let dia of mentorado.dias) {
        if (mentor.dias.includes(dia)) {
            valor += 10;
        }
    }
    // Verifica modo de aula
    if (mentor.modalidade.online === mentorado.modalidade.online) {
        valor += 1;
    }
    if (mentor.modalidade.grupos === mentorado.modalidade.grupos) {
        valor += 1;
    }
    return valor;
}

module.exports = router;