require('dotenv/config')
require('module-alias/register')
const makeWASocket = require('@adiwajshing/baileys').default
const { DisconnectReason, makeInMemoryStore, useSingleFileAuthState } = require('@adiwajshing/baileys')
const log = require('@helpers/logger')
const pino = require('pino')
const getDFResponse = require('@dialogflow/get-df-response')
const parseMessages = require('./parse-messages')

const Logger = pino().child({})
Logger.level = 'silent'

const useStore = !process.argv.includes('--no-store')

const store = useStore ? makeInMemoryStore({ logger: Logger }) : undefined
store?.readFromFile('./whatsapp_store.json')
setInterval(() => {
	store?.writeToFile('./whatsapp_store.json')
}, 10000)

const { state, saveState } = useSingleFileAuthState('./whatsapp_auth.json')

async function connectToWhatsApp() {
	const client = makeWASocket({
		printQRInTerminal: true,
		logger: Logger,
		auth: state
	})

	// Página de teste do WhatsApp
	// if (process.env.NODE_ENV === 'development') {
	require('./test-messages')(client)
	// }

	// Conexão com o WhatsApp
	client.ev.on('connection.update', ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			if ((lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
				connectToWhatsApp()
			} else {
				log('redBright', 'WhatsApp (2)')('Conexão fechada')
			}
		} else if (connection === 'open') {
			log('greenBright', 'WhatsApp (2)')('Conexão aberta')
		}
	})

	// Mensagens recebidas
	client.ev.on('messages.upsert', async ({ messages, type }) => {
		console.log(messages)
		// console.log(type, messages)
		if (type !== 'notify') return

		for (const msg of messages) {
			// Impede de receber mensagens de outros remetentes
			if (!(process.env.WHATSAPP2_ALLOW_CONTACTS || '').split(',').includes(msg.key.remoteJid)) continue

			log('cyan', 'WhatsApp (2)')('Nova mensagem', `(${type})`, JSON.stringify(messages, null, 2))

			// Impede de responder suas próprias mensagens (participant significa que foi de um grupo)
			if (!msg.participant && msg.fromMe) continue

			// Responde apenas mensagens
			if (
				!msg?.message ||
				(
					!msg?.message?.conversation &&
					!msg?.message?.templateButtonReplyMessage?.selectedDisplayText &&
					!msg?.message?.extendedTextMessage?.text &&
					!msg?.message?.buttonsResponseMessage?.selectedDisplayText &&
					!msg?.message?.listResponseMessage?.title
				)
			) continue

			try {
				const dialogFlowResponse = await getDFResponse(
					msg?.message?.conversation ||
					msg?.message?.templateButtonReplyMessage?.selectedDisplayText ||
					msg?.message?.extendedTextMessage?.text ||
					msg?.message?.buttonsResponseMessage?.selectedDisplayText ||
					msg?.message?.listResponseMessage?.title,
					msg.key.remoteJid,
					'whatsapp'
				)

				const parsedMessages = parseMessages(dialogFlowResponse)

				for (const parsedMessage of parsedMessages) {
					await client.sendMessage(msg.key.remoteJid, parsedMessage).catch(console.error)
				}

				// msg.pushName // Nome
				// msg.message.conversation // Texto
				// msg.templateButtonReplyMessage.selectedDisplayText // Texto ao clicar em botão
				// message.extendedTextMessage.text // Resposta
				// msg.key.remoteJid // Número ou numero + id do grupo
				// msg.key.participant // Número do remetente num grupo
			} catch (err) {
				console.error(err)
				await client.sendMessage(msg.key.remoteJid, { text: err.toString() })
			}
		}

		// log('cyan', 'WhatsApp (2)')('Respondendo a', messages.messages[0].key.remoteJid)
		// await client.sendMessage(messages.messages[0].key.remoteJid, { text: 'Hello there!' })
	})

	client.ev.on('creds.update', saveState)

	return client
}

connectToWhatsApp()