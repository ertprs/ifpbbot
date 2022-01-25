require('dotenv/config')
require('module-alias/register')
const chalk = require('chalk')
const log = require('@helpers/logger')
const makeBox = require('@helpers/makebox')
const printLogo = require('@helpers/print-logo')
let error = false
console.clear()
console.log(makeBox('           IFPB ChatBot           ', chalk.yellowBright, chalk.yellow))
printLogo()

// Possíveis erros
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

if (process.env.DISABLE_WHATSAPP) log('yellowBright', 'Aviso')('Robô do WhatsApp desativado por variável de ambiente')
if (process.env.DISABLE_TELEGRAM) log('yellowBright', 'Aviso')('Robô do Telegram desativado por variável de ambiente')

if (error) process.exit()

// Inicia os robôs
if (!process.env.DISABLE_WHATSAPP) require('./whatsapp')
if (!process.env.DISABLE_TELEGRAM) require('./telegram')