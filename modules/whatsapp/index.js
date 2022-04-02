require('dotenv/config')
require('module-alias/register')
const path = require('path')
const qrcode = require('qrcode-terminal')
const { Client, LocalAuth } = require('whatsapp-web.js')
const ChromeLauncher = require('chrome-launcher')
const log = require('@helpers/logger')
const getDFResponse = require('@dialogflow/get-df-response')
const { load: loadWWebJSBackup, save: saveWWebJSBackup } = require('./backup-data')
const parseMessages = require('./parse-messages')
let chromePath
try { chromePath = ChromeLauncher.Launcher.getInstallations()[0] } catch { }

async function start() {
	if (
		process.env.GOOGLE_CLIENT_ID &&
		process.env.GOOGLE_CLIENT_SECRET &&
		process.env.GOOGLE_REDIRECT_URI &&
		process.env.GOOGLE_REFRESH_TOKEN
	) {
		await loadWWebJSBackup()
	}

	const client = new Client({
		authStrategy: new LocalAuth({
			dataPath: path.join(__dirname, '.wwebjs_auth')
		}),
		puppeteer: { executablePath: chromePath, args: ['--no-sandbox'] }
	})

	setInterval(() => saveWWebJSBackup(client), 120000)
	log('yellowBright', 'WhatsApp')('Conectando, aguarde...')

	// Falha na autenticação
	client.on('auth_failure', () => {
		log('redBright', 'WhatsApp')('Falha na autenticação')
	})

	// Desconectado
	client.on('disconnected', () => {
		log('redBright', 'WhatsApp')('Desconectado')
	})

	// Imprime o QR Code
	client.on('qr', (qr) => {
		log('cyanBright', 'WhatsApp')('Escaneie o QR Code no seu WhatsApp\n')
		qrcode.generate(qr, { small: true })
	})

	// Conectado
	client.on('ready', () => {
		log('greenBright', 'WhatsApp')('Servidor aberto')
	})

	// Nova mensagem
	client.on('message', async (msg) => {
		// Permite apenas alguns contatos (para testes)
		if (process.env.WHATSAPP_ALLOWED_NUMBERS) {
			if (!process.env.WHATSAPP_ALLOWED_NUMBERS.split(',').includes(msg.from)) return
		}

		const chat = msg.getChat()

		// Ativa o estado "Digitando..."
		chat.then(c => c.sendStateTyping())

		if (msg.hasMedia) {
			return await client
				.sendMessage(msg.from, '🤷‍♂️ Desculpe, infelizmente não consigo entender áudios e outros arquivos')
				.catch(console.error)
		}

		// Retorna a resposta do DialogFlow
		getDFResponse(msg.body, msg.from, 'whatsapp')
			.then((r) => parseMessages(r, client))
			.then((m) => sendMessages(m, client, msg))
			.catch((e) => error(e, msg))
			.finally(() => {
				// Desativa o estado "Digitando..."
				chat.then(c => c.clearState())
			})
	})

	// Envia as mensagens
	async function sendMessages(msgs, client, msg) {
		for (let res of msgs) {
			// Se a mensagem for uma Promise
			if (res.then) res = await res.catch((err) => {
				console.error(err)
				return null
			})

			// Envia apenas se a mensagem for válida
			if (res) await client.sendMessage(msg.from, res).catch(console.error)
		}
	}

	// Executa caso ocorra algum erro
	function error(err, msg) {
		console.error(err)
		client.sendMessage(msg.from, 'Ops! Ocorreu um problema técnico, peço desculpas').catch(console.error)
	}

	// Inicia o servidor
	client.initialize()

	return client
}

// Evita que o servidor feche quando ocorrer um erro
process.on('uncaughtException', console.error)

module.exports = start()