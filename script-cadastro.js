const backendUrl = 'http://localhost:3000';

async function enviarFormulario(event) {
    event.preventDefault(); 
    const form = event.target;
    const formData = new FormData(form);
    
        let tipoUsuario = '';

        if((!form['monitor'].checked && !form['monitorado'].checked) || (form['monitor'].checked && form['monitorado'].checked)) {
            alert("Por favor, selecione uma opção: Monitor ou Monitorado.");
            return;
        }
        if(form['monitor'].checked) {
            tipoUsuario = 'mentor';
        } else {
            tipoUsuario = 'mentorado';
        }
        if(!formData.get("nome-de-guerra") || !formData.get("e-mail") || !formData.get("senha") || !formData.get("confirmação-da-senha") || !formData.get("serie") || formData.getAll("materias-" + tipoUsuario).length === 0 || formData.getAll("dias-disponiveis").length === 0) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const senha = formData.get('senha');
        const confirmacaoSenha = formData.get('confirmação-da-senha');

        if (senha !== confirmacaoSenha) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
        }

    const dadosFormulario = {
        nome: formData.get('nome-de-guerra'),
        email: formData.get('e-mail').toLowerCase(),
        senha: senha,

        serie: formData.get('serie'),
        materias: formData.getAll('materias-' + tipoUsuario),
        dias: formData.getAll('dias-disponiveis'),
        modalidade: {
            online: formData.get('modo-de-ensino') === 'online',
            presencial: formData.get('modo-de-ensino') === 'presencial',
            duplas: formData.get('modalidade') === 'em-duplas',
            grupo: formData.get('modalidade') === 'em-grupo'
        }
        
    };

        console.log(dadosFormulario);

    await fetch(backendUrl + '/' + tipoUsuario, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosFormulario)
    }).catch(err => {
        console.error('Erro ao enviar o formulário:', err);
    });
    alert("Cadastro realizado com sucesso!");
    window.location.href = 'login.html';
}