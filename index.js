console.clear()
require('dotenv/config')
const fs = require('fs')
const chalk = require('chalk')
const qrcode = require('qrcode-terminal')
const { Client } = require('whatsapp-web.js')
const ChromeLauncher = require('chrome-launcher')
const chromePath = ChromeLauncher.Launcher.getInstallations()[0]
const jsonParse = require('./helpers/json-parse')
const printLogo = require('./helpers/print-logo')
const makeBox = require('./helpers/makebox')
const getDFMessage = require('./get-df-message')


const SESSION_FILE_PATH = './wa-session.json'
const client = new Client({
	session: fs.existsSync(SESSION_FILE_PATH) ?
		require(SESSION_FILE_PATH) :
		jsonParse(process.env.WHATSAPP_TOKEN, null, null, true),
	puppeteer: { executablePath: chromePath }
})


console.log(makeBox('Conectando, aguarde...', chalk.yellowBright, chalk.yellow, { before: ' ' }))
printLogo()
process.title = 'Conectando...'

// Quando conectar, salva a sessão no arquivo
client.on('authenticated', (session) => {
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), () => { })
})

// Falha na autenticação
client.on('auth_failure', (session) => {
	console.clear()
	console.log(makeBox('Falha na autenticação do WhatsApp', chalk.redBright, chalk.red, { before: ' ' }))
	printLogo()
	process.title = 'Falha na autenticação'
})

// Desconectado
client.on('disconnected', (session) => {
	console.clear()
	console.log(makeBox('Desconectado', chalk.redBright, chalk.red, { before: ' ' }))
	printLogo()
	process.title = 'Desconectado'
})

// Imprime o QR Code
client.on('qr', (qr) => {
	console.clear()
	process.title = 'Aguardando autenticação...'
	console.log(makeBox('Escaneie o QR Code no seu WhatsApp', chalk.cyanBright, chalk.cyan, { before: ' ' }))
	qrcode.generate(qr, { small: true })
})

// Conectado
client.on('ready', () => {
	console.clear()
	console.log(makeBox('Conectado!', chalk.greenBright, chalk.green, { before: ' ' }))
	printLogo()
	process.title = `IFPB ChatBot`
})

// Nova mensagem
client.on('message', async (msg) => {
	const chat = msg.getChat()

	// Ativa o estado "Digitando..."
	chat.then(c => c.sendStateTyping())

	// Retorna a resposta do DialogFlow
	try {
		getDFMessage(msg.body, msg.from, client).then(async (msgs) => {
			for (let res of msgs) {
				// Se a mensagem for uma Promise
				if (res.then) res = await res.catch((err) => {
					console.error(err)
					return null
				})

				// Envia se a mensagem for válida
				if (res) await client.sendMessage(msg.from, res).catch(console.error)
			}
		})
	} catch (err) {
		console.error(err)
		await client.sendMessage(msg.from, 'Ops! Ocorreu um problema técnico, peço desculpas').catch(console.error)
	}

	// Desativa o estado "Digitando..."
	chat.then(c => c.clearState())
})

client.initialize()

process.on('uncaughtException', console.error)