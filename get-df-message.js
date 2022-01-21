const CREDENTIALS = JSON.parse(process.env.GCLOUD_CREDENTIALS)
const dialogflow = require('@google-cloud/dialogflow')
const { value } = require('pb-util')
const Session = require('./helpers/sessions')
const sessions = new Session('./sessions.json')
const SESSIONS_DATA = sessions.data
const { Buttons, Contact, MessageMedia } = require('whatsapp-web.js')


// RETORNA A RESPOSTA DO DIALOGFLOW
async function getDFMessage(text, from, client) {
	SESSIONS_DATA.totalMsgCount = SESSIONS_DATA.totalMsgCount || 0
	process.title = 'Mensagem recebida'
	setTimeout(() => process.title = `IFPB ChatBot (${++SESSIONS_DATA.totalMsgCount})`, 100)

	const sessionClient = new dialogflow.SessionsClient({
		credentials: CREDENTIALS
	})
	const sessionPath = sessionClient.projectAgentSessionPath(
		process.env.PROJECT_ID, from
	)

	// Salva as sessões na variável SESSIONS_DATA
	// Cria uma nova sessão caso não exista
	if (!SESSIONS_DATA[from]) SESSIONS_DATA[from] = {
		_lastMessageDate: Date.now(),
		_contexts: []
	}
	// Se a última mensagem da pessoa foi há mais de 5 minutos, define os contextos
	if (Date.now() - SESSIONS_DATA[from]._lastMessageDate > 300000) {
		await setContexts(SESSIONS_DATA[from]._contexts, sessionPath)
	}

	// Faz um request para o servidor do Dialogflow
	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				text: text,
				languageCode: 'pt-BR'
			}
		}
	}

	const [response] = await sessionClient.detectIntent(request)

	// Atualiza as sessões
	SESSIONS_DATA[from]._contexts = response.queryResult.outputContexts
	SESSIONS_DATA[from]._lastMessageDate = Date.now()

	// Converte as respostas em formado de String e Payload em Objeto
	let responses = response.queryResult.fulfillmentMessages.map((msg) => {
		if (msg.text) return {
			type: 'text',
			text: msg.text.text.join('\n')
		}
		if (msg.payload) {
			return value.decode(msg.payload.fields.richContent)[0]
		}
	}).flat()

	if (process.env.NODE_ENV === 'development')
		console.log(JSON.stringify(responses, null, '  '))

	for (const i in responses) {
		const msg = responses[i]

		// Remove as respostas com o parâmetro "ignoreWhatsApp"
		if (msg.ignoreWhatsApp || msg.ignoreWhatsapp || msg.ignorewhatsapp || msg.ignorewhatsApp) {
			responses[i] = null
			continue
		}

		// Converte links de Chips para texto
		if (msg.type === 'chips' && msg.options.some(o => o.link)) {
			responses[i] = msg.options.map(o => ({
				type: 'text',
				text: `*${o.text}*\n${o.link || ''}`
			}))
		}

		// Une respostas com Chips e com Texto
		if (msg.type === 'chips' && i - 1 >= 0 && responses[i - 1].type === 'text') {
			msg.prompt = responses[i - 1].text
			responses[i - 1] = null
		}
	}

	// Converte as respostas para o formato da biblioteca WhatsApp Web JS
	return responses.flat().filter(msg => msg).map(r => parseResponse(r, client)).filter(msg => msg)
}


// CONVERTE AS RESPOSTAS PARA O FORMATO DA BIBLIOTECA WHATSAPP WEB JS
function parseResponse(msg, client) {
	switch (msg.type) {
		case 'text': return msg.text
		case 'chips':
			const buttons = msg.options.map((opt) => ({ body: opt.text }))
			return new Buttons(msg.prompt || '​', buttons)
		case 'image':
			return MessageMedia.fromUrl(msg.rawUrl, { unsafeMime: true }).then(file => {
				file.filename = msg.accessibilityText
				return file
			})
		case 'file':
			return MessageMedia.fromUrl(msg.url, { unsafeMime: true }).then(file => {
				file.filename = msg.name
				return file
			})
		case 'contact':
			return client.getContactById(msg.number)
		case 'accordion':
			return `*${msg.title}*\n────────────────────\n${msg.text}`
		default:
			return null
	}
}


// ATUALIZA OS CONTEXTOS
async function setContexts(contexts = [], sessionPath) {
	if (contexts.length <= 0) return
	const contextClient = new dialogflow.ContextsClient({
		credentials: CREDENTIALS
	})

	for (const context of contexts) {
		await contextClient.createContext({
			parent: sessionPath,
			context: context
		})
	}
}

module.exports = getDFMessage