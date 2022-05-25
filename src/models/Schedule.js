const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	status: { type: String, enum: ['waiting', 'done'], default: 'waiting', required: true }, // Status do agendamento
	receivers: { type: Number, default: null }, // Quantidade de pessoas que receberam
	date: { type: Date, required: true }, // Data da entrega
	messages: { type: [Object], required: true }, // Mensagens
	onlyRegistered: { type: Boolean, default: true }, // Apenas usuários registrados podem receber?
	specificChats: { type: Array }, // Chats específicos
	specificCourses: { type: [String] }, // Cursos específicos que podem receber (se for null, todos os cursos podem receber)
	specificGrades: { type: [String] }, // Séries específicas que podem receber
	specificClasses: { type: [String] } // Turmas específicas que podem receber
})

module.exports = mongoose.model('Schedule', schema)