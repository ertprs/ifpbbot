require('dotenv/config')
require('module-alias/register')
const chalk = require('chalk')
const log = require('@logger')
const makeBox = require('@helpers/makebox')
const printLogo = require('@helpers/print-logo')
const { isDisabled } = require('@helpers')
process.on('uncaughtException', log('redBright', 'Erro não capturado'))
const MODULES = require('./modules')
let error = false

// Limpa a tela e imprime o logo
console.clear()
console.log(makeBox('           IFPB ChatBot           ', chalk.yellowBright, chalk.yellow))
printLogo()

// Módulo de status do servidor
try {
	require('@modules/status')
} catch (err) {
	log('redBright', 'Erro')('Erro ao executar o módulo de status do servidor', err)
}

// Checa possíveis erros
try {
	JSON.parse(process.env.GCLOUD_CREDENTIALS)
} catch {
	error = true
	log('redBright', 'Erro')('Credenciais do Dialogflow faltando')
	log('magentaBright', 'Erro')('Inclua suas credenciais do Dialogflow na variável de ambiente GCLOUD_CREDENTIALS')
}

if (!process.env.PROJECT_ID) {
	error = true
	log('redBright', 'Erro')('Nome do projeto do Dialogflow faltando')
	log('magentaBright', 'Erro')('Inclua o nome do projeto do Dialogflow na variável de ambiente PROJECT_ID')
}

// Fecha o processo se houver algum erro
if (error) process.exit()

// Inicia os módulos
MODULES.forEach(start)

// Inicia um módulo
function start(mod) {
	const { path, disabled, disabledMessage, started, error } = mod
	if (disabled) return log('cyan', 'Aviso')(disabledMessage)
	try {
		require(`./modules/${path}`)
		mod.started = true
	} catch (err) {
		log('redBright', 'Erro')(`Erro ao executar o módulo ${path}`, err)
		mod.error = { message: err.message, stack: err.stack }
	}
}