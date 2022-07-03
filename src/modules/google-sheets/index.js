require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const app = require('@config/http')
const { jsonParse } = require('@helpers')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()

const parseIntents = require('./parse-intents')
const listIntents = require('./list-intents')
const deleteIntents = require('./delete-intents')
const createIntents = require('./create-intents')

if (process.env.GOOGLE_SHEETS_USERS) router.use(basicAuth({
	users: jsonParse(process.env.GOOGLE_SHEETS_USERS),
	unauthorizedResponse: () => '401 Unauthorized'
}))

let operationsCooldown = -Infinity

router.post('/dialogflow/syncIntents', async (req, res) => {
	// Se estiver em cooldown retorna um erro
	if (Date.now() < operationsCooldown) return res.status(503).json({
		success: false,
		wait: operationsCooldown - Date.now()
	})

	operationsCooldown = Date.now() + 60000

	try {
		const startTime = Date.now()
		let { data, sheetID } = req.body
		sheetID = sheetID || Math.floor(Math.random() * 9999).toString()

		const intents = parseIntents(data, sheetID)
		const currentIntents = await listIntents(sheetID)
		const deleteErrors = await deleteIntents(currentIntents)
		const createErrors = await createIntents(intents)

		log('greenBright', 'Planilhas Google')(`Requisição finalizada (${deleteErrors + createErrors} erro(s) - ${Date.now() - startTime}ms)`)

		res.json({
			success: true,
			addedIntents: intents.length,
			removedIntents: currentIntents.length,
			errors: deleteErrors + createErrors,
			time: Date.now() - startTime
		})
	} catch (err) {
		res.json({ success: false, error: err })
		log('redBright', 'Erro')('Erro ao inserir dados das Planilhas Google', err)
	}
})

router.post('/dialogflow/syncParsedIntents', async (req, res) => {
	try {
		const startTime = Date.now()
		let { intents, sheetID } = req.body
		sheetID = sheetID || Math.floor(Math.random() * 9999).toString()

		const currentIntents = await listIntents(sheetID)
		await deleteIntents(currentIntents)
		await createIntents(intents)

		res.json({
			success: true,
			addedIntents: intents.length,
			removedIntents: currentIntents.length,
			time: Date.now() - startTime
		})
	} catch (err) {
		res.json({ success: false })
		log('redBright', 'Erro')('Erro ao inserir dados das Planilhas Google', err)
	}
})

app.use('/googleSheets', router)

const PORT = process.env.PORT || 443
log('greenBright', 'Planilhas Google')(`Servidor aberto na porta ${PORT} na rota /googleSheets`)

module.exports = router