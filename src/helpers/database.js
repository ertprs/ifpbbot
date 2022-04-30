const mongoose = require('mongoose')
const log = require('@helpers/logger')

if (!process.env.MONGO_DB) {
	log('redBright', 'Erro')('Credenciais do banco de dados MongoDB faltando')
	throw new Error('Credenciais do banco de dados MongoDB faltando')
}

let mongoDBURL = process.env.MONGO_DB || 'mongodb://localhost'

mongoose.connection.on('connecting', () => log('yellowBright', 'MongoDB')('Conectando...'))
mongoose.connection.on('connected', () => log('greenBright', 'MongoDB')('Conectado'))
mongoose.connection.on('disconnected', () => log('redBright', 'MongoDB')('Desconectado'))
mongoose.connection.on('error', (err) => {
	log('redBright', 'MongoDB')('Falha ao conectar', err)
	setTimeout(mongoConnect, 5000)
})

function mongoConnect() {
	mongoose.connect(mongoDBURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).catch(() => { })
}

mongoConnect()

require('@models/Sessions')
require('@models/Teacher')