const log = require('@logger')
const dialogflow = require('@google-cloud/dialogflow')
const { jsonParse } = require('@helpers/helpers')
const CREDENTIALS = jsonParse(process.env.GCLOUD_CREDENTIALS)

/**
 * Atualiza os contextos expirados no Dialogflow
 * @async
 * @param {object[]} contexts - Array de contextos
 * @param {string} sessionPath - Caminho da sessão
 * @returns {Promise<void>}
 */
async function setContexts(contexts = [], sessionPath) {
	try {
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
	} catch (err) {
		log('redBright', 'Dialogflow')('Ocorreu um erro ao definir contextos', err.message)
	}
}

module.exports = setContexts