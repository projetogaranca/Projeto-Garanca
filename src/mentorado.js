const mongoose = require('mongoose');
const mentoradoSchema = new mongoose.Schema({
    nome: String,
    senha: String,
    email: String,

    serie: String,
    materias: [String],
    dias: [String],
    modalidade: {
        online: Boolean,
        presencial: Boolean,
        duplas: Boolean,
        grupo: Boolean
    },

    pareamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentores',
    }
})

const Mentorado = mongoose.model('Mentorados', mentoradoSchema);

module.exports = Mentorado;