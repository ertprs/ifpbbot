const fs = require('fs')
const { jsonParse } = require('@helpers')
const dialogflow = require('@google-cloud/dialogflow')
const CREDENTIALS = jsonParse(process.env.GCLOUD_CREDENTIALS)

function exportAgent() {
	const agentClient = new dialogflow.AgentsClient({
		credentials: CREDENTIALS
	})

	const parent = `projects/${process.env.PROJECT_ID}/locations/global`

	return agentClient.exportAgent({ parent }).then((response) => {
		return response[0].result.agentContent
	})
}

module.exports = exportAgent