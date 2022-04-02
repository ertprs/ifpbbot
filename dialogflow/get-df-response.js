const path = require('path')
const jsonParse = require('@helpers/json-parse')
const dialogflow = require('@google-cloud/dialogflow')
const { value } = require('pb-util')
const setContexts = require('./set-df-contexts')
const LocalSessions = require('@helpers/LocalSessions')
const RemoteSessions = require('@helpers/RemoteSessions')
const sessions = process.env.DB_NAME && process.env.DB_USERNAME && process.env.DB_HOST
	? new RemoteSessions()
	: new LocalSessions(path.resolve(__dirname, './df-sessions.json'))

const CREDENTIALS = jsonParse(process.env.GCLOUD_CREDENTIALS)

/**
 * Faz uma requisição para o Dialogflow
 * 
 * @async
 * @param {string} text - Texto da mensagem recebida
 * @param {string} from - ID único do chat ou contato da mensagem recebida
 * @param {string} [platform=''] - Prefixo para o ID de sessão usado para diferenciar plataformas (exemplo: 'whatsapp')
 * @returns {Promise<{ responses: object[] }>} Retorna as respostas do Dialogflow
 */
async function getDFResponse(text, from, platform = '') {
	from = platform + from

	// Cria ou retoma as sessões remotas
	const sessionClient = new dialogflow.SessionsClient({
		credentials: CREDENTIALS
	})

	const sessionPath = sessionClient.projectAgentSessionPath(
		process.env.PROJECT_ID, from
	)

	// Cria uma nova sessão caso não exista
	if (!sessions.data[from]) sessions.data[from] = {
		lastMessageDate: Date.now(),
		contexts: []
	}

	// Se a última mensagem da pessoa foi há mais de 5 minutos, define os contextos no Dialogflow
	if (Date.now() - sessions.data[from].lastMessageDate > 300000) {
		await setContexts(sessions.data[from].contexts, sessionPath)
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
	const contexts = response.queryResult.outputContexts

	// Atualiza as sessões
	sessions.data[from].contexts = contexts
	sessions.data[from].lastMessageDate = Date.now()

	// Converte as respostas em formato de String e Payload em Objeto
	const responses = response.queryResult.fulfillmentMessages.map((msg) => {
		if (msg.text) return {
			type: 'text',
			text: msg.text.text.join('\n')
		}
		if (msg.payload) {
			return value.decode(msg.payload.fields.richContent)[0]
		}
	}).flat()

	// Retorna as respostas do Dialogflow
	return responses
}

module.exports = getDFResponse