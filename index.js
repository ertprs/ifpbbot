require('dotenv/config')
require('module-alias/register')
const chalk = require('chalk')
const log = require('@helpers/logger')
const makeBox = require('@helpers/makebox')
const printLogo = require('@helpers/print-logo')
let error = false
const {
	GCLOUD_CREDENTIALS,
	PROJECT_ID,
	DISABLE_WHATSAPP,
	DISABLE_TELEGRAM,
	DISABLE_WEBHOOK,
	DISABLE_SITE
} = process.env

console.clear()
console.log(makeBox('           IFPB ChatBot           ', chalk.yellowBright, chalk.yellow))
printLogo()

// Possíveis erros
try {
	JSON.parse(GCLOUD_CREDENTIALS)
} catch {
	error = true
	log('redBright', 'Erro')('Credenciais do Dialogflow faltando')
	log('magentaBright', 'Erro')('Inclua suas credenciais do Dialogflow na variável de ambiente GCLOUD_CREDENTIALS')
}

if (!PROJECT_ID) {
	error = true
	log('redBright', 'Erro')('Nome do projeto do Dialogflow faltando')
	log('magentaBright', 'Erro')('Inclua o nome do projeto do Dialogflow na variável de ambiente PROJECT_ID')
}

if (isDisabled(DISABLE_WHATSAPP)) log('yellowBright', 'Aviso')('Robô do WhatsApp desativado por variável de ambiente')
if (isDisabled(DISABLE_TELEGRAM)) log('yellowBright', 'Aviso')('Robô do Telegram desativado por variável de ambiente')
if (isDisabled(DISABLE_WEBHOOK)) log('yellowBright', 'Aviso')('Servidor webhook desativado por variável de ambiente')
if (isDisabled(DISABLE_SITE)) log('yellowBright', 'Aviso')('Site desativado por variável de ambiente')

if (error) process.exit()

// Inicia os robôs
if (!isDisabled(DISABLE_WHATSAPP)) require('./whatsapp')
if (!isDisabled(DISABLE_TELEGRAM)) require('./telegram')
if (!isDisabled(DISABLE_WEBHOOK)) require('./webhook')
if (!isDisabled(DISABLE_SITE)) require('./site')

// Retorna false se a string indica que não é para desabilitar
function isDisabled(string) {
	const DISABLED_STRINGS = ['false', 'no', '0', '']
	return !!(string && !DISABLED_STRINGS.includes(string))
}