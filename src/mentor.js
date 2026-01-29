const mongoose = require('mongoose');
const mentorSchema = new mongoose.Schema({
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
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Mentorados',
        default: []
    }
})

const Mentor = mongoose.model('Mentores', mentorSchema);

module.exports = Mentor;