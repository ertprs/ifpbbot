require('dotenv/config')
const dialogflow = require('@google-cloud/dialogflow')
const venom = require('venom-bot')
const { value } = require('pb-util')
const SESSIONS_DATA = {}
const CREDENTIALS = JSON.parse(process.env.GCLOUD_CREDENTIALS)


venom.create({
	session: 'session-name',
	multidevice: false,
	// disableWelcome: true,
	// updatesLog: false
}).then((client) => start(client))
	.catch(console.error)

function start(client) {
	client.onMessage((message) => {
		getDialogMessage(client, message.body, message.from)
	})
}

// RETORNA A RESPOSTA DO DIALOGFLOW
async function getDialogMessage(client, text, from) {
	client.startTyping(from)

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
	// console.log(JSON.stringify(response, null, '\t'))

	// Atualiza as sessões
	SESSIONS_DATA[from]._contexts = response.queryResult.outputContexts
	SESSIONS_DATA[from]._lastMessageDate = Date.now()

	
	const responses = response.queryResult.fulfillmentMessages.map((msg) => {
		if (msg.text) return {
			type: 'text',
			text: msg.text.text.join('\n')
		}
		if (msg.payload) {
			return value.decode(msg.payload.fields.richContent)[0]
		}
	}).flat()

	console.log(JSON.stringify(responses, null, '  '))

	for (const i in responses) {
		const msg = responses[i]
		if (msg.type === 'chips' && i - 1 >= 0 && responses[i - 1].type === 'text') {
			msg.prompt = responses[i - 1].text
			responses[i - 1] = null
		}
	}

	for (const msg of responses) {
		if (!msg) continue
		if (msg.type === 'text') {
			await client.sendText(from, msg.text).catch(console.error)
		} else if (msg.type === 'chips') {
			const buttons = msg.options.map((opt) => {
				return { buttonText: { displayText: opt.text } }
			})
			// await client.sendButtons(from, '💡 *Opções sugeridas*', buttons, '_Clique para enviar_').catch(console.error)
			await client.sendButtons(from, msg.prompt || '​', buttons, '​').catch(console.error)
		} else if (msg.type === 'image') {
			await client.sendImage(from, msg.rawUrl, 'image-' + Date.now(), msg.accessibilityText).catch(console.error)
		}
	}

	await client.stopTyping(from)
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