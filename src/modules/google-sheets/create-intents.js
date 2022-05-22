const log = require('@logger')
const dialogflow = require('@google-cloud/dialogflow')
const { value } = require('pb-util')
const projectId = process.env.PROJECT_ID
const intentsClient = new dialogflow.IntentsClient({
	credentials: JSON.parse(process.env.GCLOUD_CREDENTIALS)
})

/**
 * Adiciona as intents da planilha no Dialogflow
 */
async function createIntents(intents) {
	const operations = []

	for (const i in intents) {
		const intent = intents[i]
		const parent = intentsClient.projectAgentPath(projectId)

		intent.trainingPhrases = intent.trainingPhrases.map((phrase) => {
			return {
				type: 'EXAMPLE',
				parts: [{ text: phrase }]
			}
		})

		intent.messages = intent.messages.map((message) => {
			if (message.type === 'text') {
				return { text: { text: message.text } }
			} else {
				return {
					payload: value.encode({ richContent: [[message]] }).structValue
				}
			}
		})

		const operation = () => intentsClient.createIntent({ parent, intent }).then((response) => {
			log('cyan', 'Planilhas Google', true)(`Intent criada (${+i + 1}/${intents.length}) ${response?.[0]?.displayName}`)
		}).catch((err) => {
			log('cyan', 'Planilhas Google')(`Erro ao criar intent (${+i + 1}/${intents.length})`, err.message)
			throw err
		})

		operations.push(operation)
	}

	return operations
}

module.exports = createIntents