const log = require('@helpers/logger')
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
	for (const i in intents) {
		const intent = intents[i]
		const parent = intentsClient.projectAgentPath(projectId)

		intent.messages = intent.messages.map((message) => {
			if (message.payload) {
				message.payload = value.encode(message.payload).structValue
			}
			return message
		})

		const [response] = await intentsClient.createIntent({ parent, intent })

		log('cyan', 'Planilhas Google', true)(`Intent criada (${+i + 1}/${intents.length}) ${response.displayName}`)
	}
}

module.exports = createIntents