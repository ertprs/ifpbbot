require('dotenv/config')
const fs = require('fs')
const { Client } = require('whatsapp-web.js')
const jsonParse = require('./helpers/json-parse')
const qrcode = require('qrcode-terminal')
const ChromeLauncher = require('chrome-launcher')
const chromePath = ChromeLauncher.Launcher.getInstallations()[0]
const getDFMessage = require('./get-df-message')

const SESSION_FILE_PATH = './wa-session.json'
const client = new Client({
	session: fs.existsSync(SESSION_FILE_PATH) ?
		require(SESSION_FILE_PATH) :
		jsonParse(process.env.WHATSAPP_TOKEN, null, undefined),
	puppeteer: { executablePath: chromePath }
})

console.log('Conectando, aguarde...')

// Quando conectar, salva a sessão no arquivo
client.on('authenticated', (session) => {
	fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), () => {})
})

// Imprime o QR Code
client.on('qr', (qr) => {
	console.clear()
	console.log('Escaneie o QR Code no seu WhatsApp\n')
	qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
	console.log('Conectado!')
})

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