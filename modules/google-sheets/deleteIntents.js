const log = require('@helpers/logger')
const dialogflow = require('@google-cloud/dialogflow')
const intentsClient = new dialogflow.IntentsClient({
	credentials: JSON.parse(process.env.GCLOUD_CREDENTIALS)
})

/**
 * Exclui as intents de planilha do Dialogflow
 */
async function deleteIntents(intents) {
	for (const i in intents) {
		const intent = intents[i]
		await intentsClient.deleteIntent({ name: intent.name })
		
		log('cyan', 'Planilhas Google', true)(`Intent excluída (${+i + 1}/${intents.length}) ${intent.displayName}`)
	}
}

module.exports = deleteIntents