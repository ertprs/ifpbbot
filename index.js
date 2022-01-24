require('dotenv/config')
require('module-alias/register')
const chalk = require('chalk')

// Possíveis erros
try {
	JSON.parse(process.env.GCLOUD_CREDENTIALS)
} catch {
	console.error(chalk.redBright('[ERRO] Credenciais do Dialogflow faltando'))
	console.error(chalk.magenta('Inclua suas credenciais do Dialogflow na variável de ambiente GCLOUD_CREDENTIALS'))
	process.exit()
}

if (!process.env.PROJECT_ID) {
	console.error(chalk.redBright('[ERRO] Nome do projeto do Dialogflow faltando'))
	console.error(chalk.magenta('Inclua o nome do projeto do Dialogflow na variável de ambiente PROJECT_ID'))
	process.exit()
}

// Inicia os robôs
// require('./whatsapp')
require('./telegram')