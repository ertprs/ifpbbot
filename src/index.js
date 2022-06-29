require('dotenv/config')
require('module-alias/register')
const chalk = require('chalk')
const log = require('@logger')
const makeBox = require('@helpers/makebox')
const printLogo = require('@helpers/print-logo')
const { isDisabled } = require('@helpers')
process.on('uncaughtException', log('redBright', 'Erro não capturado'))
let error = false

// MÓDULOS
const MODULES = ([
	// Caminho do módulo; Desabilitar; Mensagem de desabilitado
	['whatsapp', process.env.DISABLE_WHATSAPP, 'Robô do WhatsApp desativado por variável de ambiente'],
	['telegram', process.env.DISABLE_TELEGRAM, 'Robô do Telegram desativado por variável de ambiente'],
	['google-sheets', process.env.DISABLE_GOOGLE_SHEETS, 'Integração com Planilhas Google desativado por variável de ambiente'],
	['webhook', process.env.DISABLE_WEBHOOK, 'Servidor webhook desativado por variável de ambiente'],
	['scheduler', process.env.DISABLE_SCHEDULER, 'Agendador desativado por variável de ambiente'],
	['site', process.env.DISABLE_SITE, 'Site desativado por variável de ambiente'],
	['backup', process.env.DISABLE_BACKUP, 'Backup desativado por variável de ambiente']
])

// Limpa a tela e imprime o logo
console.clear()
console.log(makeBox('           IFPB ChatBot           ', chalk.yellowBright, chalk.yellow))
printLogo()

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
MODULES.forEach((module) => start(...module))

// Inicia um módulo
function start(moduleName, disabled = false, disabledMessage = '') {
	if (isDisabled(disabled)) return log('cyan', 'Aviso')(disabledMessage)
	try {
		require(`./modules/${moduleName}`)
	} catch (err) {
		log('redBright', 'Erro')(`Erro ao executar o módulo ${moduleName}`, err)
	}
}