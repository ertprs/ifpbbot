const log = require('@helpers/logger')
const dialogflow = require('@google-cloud/dialogflow')
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
		const agentPath = intentsClient.projectAgentPath(projectId)

		intent.trainingPhrases = intent.trainingPhrases.map((phrase) => {
			return {
				type: 'EXAMPLE',
				parts: [{ text: phrase }]
			}
		})

		const finalIntent = {
			displayName: intent.name,
			trainingPhrases: intent.trainingPhrases,
			messages: [{
				text: { text: intent.responses }
			}]
		}

		const [response] = await intentsClient.createIntent({
			parent: agentPath,
			intent: finalIntent
		})

		if (process.env.NODE_ENV === 'development') {
			log('Planilhas Google')(`Intent criada (${+i + 1}/${intents.length}) ${response.displayName}`)
		}
	}
}

module.exports = createIntents