const log = require('@logger')
const dialogflow = require('@google-cloud/dialogflow')
const intentsClient = new dialogflow.IntentsClient({
	credentials: JSON.parse(process.env.GCLOUD_CREDENTIALS)
})

/**
 * Exclui as intents de planilha do Dialogflow
 */
async function deleteIntents(intents) {
	const operations = []

	for (const i in intents) {
		const intent = intents[i]
		const operation = () => intentsClient.deleteIntent({ name: intent.name }).then(() => {
			log('cyan', 'Planilhas Google', true)(`Intent excluída (${+i + 1}/${intents.length}) ${intent.displayName}`)
		}).catch((err) => {
			log('cyan', 'Planilhas Google')(`Erro ao excluir intent (${+i + 1}/${intents.length}) ${intent.displayName}`, err.message)
			throw err
		})

		operations.push(operation)
	}

	return operations
}

module.exports = deleteIntents