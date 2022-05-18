require('dotenv/config')
require('module-alias/register')
const makeWASocket = require('@adiwajshing/baileys').default
const { DisconnectReason, makeInMemoryStore, useSingleFileAuthState } = require('@adiwajshing/baileys')
const log = require('@helpers/logger')
const pino = require('pino')

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
	client.ev.on('messages.upsert', async (messages) => {
		log('cyan', 'WhatsApp (2)')('Nova mensagem', JSON.stringify(messages, null, 2))
		if (messages.messages[0].pushName !== process.env.WHATSAPP2_ALLOW_CONTACT) return
		log('cyan', 'WhatsApp (2)')('Respondendo a', messages.messages[0].key.remoteJid)
		await client.sendMessage(messages.messages[0].key.remoteJid, { text: 'Hello there!' })
	})

	client.ev.on('creds.update', saveState)

	return client
}

connectToWhatsApp()