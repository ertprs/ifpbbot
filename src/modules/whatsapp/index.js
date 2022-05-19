require('dotenv/config')
require('module-alias/register')
const makeWASocket = require('@adiwajshing/baileys').default
const { useSingleFileAuthState } = require('@adiwajshing/baileys')
const log = require('@helpers/logger')
const pino = require('pino')
const getDFResponse = require('@dialogflow/get-df-response')
const parseMessages = require('./parse-messages')
const useRemoteAuthState = require('./remote-state')

// Desabilita os logs padrão
const Logger = pino().child({})
Logger.level = 'silent'

// Armazenamento de estado do WhatsApp no banco de dados
const remote = useRemoteAuthState('./whatsapp_auth.json')

async function connectToWhatsApp() {
	// Carrega o estado do WhatsApp no banco de dados
	if (process.env.MONGO_DB) await remote.loadState()
	const local = useSingleFileAuthState('./whatsapp_auth.json')

	const client = makeWASocket({
		printQRInTerminal: true,
		logger: Logger,
		auth: local.state
	})

	// Página de teste do WhatsApp
	if (process.env.NODE_ENV === 'development') {
		require('./test-messages')(client, local.state?.creds?.me?.id)
	}

	// Observa mudanças na conexão com o WhatsApp
	client.ev.on('connection.update', ({ connection, lastDisconnect }) => {
		if (connection === 'close') {
			log('redBright', 'WhatsApp')(
				'Conexão fechada, motivo:',
				lastDisconnect?.error?.output?.payload?.error, '-',
				lastDisconnect?.error?.output?.payload?.message, '-',
				lastDisconnect?.error?.output?.statusCode
			)
			setTimeout(connectToWhatsApp, 10000)
		} else if (connection === 'open') {
			log('greenBright', 'WhatsApp')('Conexão aberta')
		}
	})

	// Mensagens recebidas
	client.ev.on('messages.upsert', async ({ messages, type }) => {
		// Responde apenas a novas mensagens
		if (type !== 'notify') return

		for (const msg of messages) {
			// Impede de receber mensagens de outros remetentes
			if (process.env.WHATSAPP_ALLOWED_NUMBERS) {
				if (!process.env.WHATSAPP_ALLOWED_NUMBERS.split(',').includes(msg?.key?.remoteJid)) continue
			}

			log('cyan', 'WhatsApp', true)('Nova mensagem', `(${type})`, JSON.stringify(messages, null, 2))

			// Impede de responder suas próprias mensagens (participant significa que foi de um grupo)
			if (!msg.participant && msg.fromMe) continue

			// Texto da mensagem
			const msgText = msg?.message?.conversation || // Mensagem normal
				msg?.message?.templateButtonReplyMessage?.selectedDisplayText || // Mensagem do botão de template
				msg?.message?.extendedTextMessage?.text || // ???
				msg?.message?.buttonsResponseMessage?.selectedDisplayText || // Mensagem do botão
				msg?.message?.listResponseMessage?.title // Mensagem de uma lista de respostas

			// Pula mensagens inválidas
			if (!msg?.message || !msgText) continue

			try {
				// Marca a mensagem como lida
				client.readMessages([msg?.key])
				// Adiciona o status "Digitando..."
				client.sendPresenceUpdate('composing', msg?.key?.remoteJid)

				// Retorna as respostas do Dialogflow
				const dialogflowResponse = await getDFResponse(
					msgText,
					msg?.key?.remoteJid + (msg?.key?.participant || ''),
					'whatsapp'
				)

				// Transforma as mensagens do formato do Dialogflow em mensagens do WhatsApp
				const parsedMessages = parseMessages(dialogflowResponse, msg)

				for (const parsedMessage of parsedMessages) {
					// Envia a resposta
					await client.sendMessage(msg?.key?.remoteJid, parsedMessage).catch(console.error)
				}

				// Remove o status "Digitando..."
				client.sendPresenceUpdate('paused', msg?.key?.remoteJid)

			} catch (err) {
				// Ao ocorrer um erro
				console.error(err)
				await client.sendMessage(msg.key.remoteJid, { text: '🐛 _Desculpe! Ocorreu um erro ao analisar as mensagens_' })
			}
		}
	})

	client.ev.on('creds.update', () => {
		// Salva o estado do WhatsApp localmente e no banco de dados
		local.saveState()
		remote.saveState()
	})

	return client
}

connectToWhatsApp()