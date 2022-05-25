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
	let errors = 0
	for (const i in intents) {
		try {
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

			const [response] = await intentsClient.createIntent({ parent, intent })

			log('cyan', 'Planilhas Google', true)(`Intent criada (${+i + 1}/${intents.length}) ${response.displayName}`)
		} catch (err) {
			log('redBright', 'Planilhas Google')('Erro ao criar intent', err)
			errors++
		}
	}

	return errors
}

module.exports = createIntents