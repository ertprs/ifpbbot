const log = require('@logger')
const dialogflow = require('@google-cloud/dialogflow')
const intentsClient = new dialogflow.IntentsClient({
	credentials: JSON.parse(process.env.GCLOUD_CREDENTIALS)
})

/**
 * Exclui as intents de planilha do Dialogflow
 */
async function deleteIntents(intents) {
	let errors = 0
	for (const i in intents) {
		try {
			const intent = intents[i]
			await intentsClient.deleteIntent({ name: intent.name })

			log('cyan', 'Planilhas Google', true)(`Intent excluída (${+i + 1}/${intents.length}) ${intent.displayName}`)
		} catch (err) {
			log('redBright', 'Planilhas Google')('Erro ao excluir intent', err)
			errors++
		}
	}

	return errors
}

module.exports = deleteIntents