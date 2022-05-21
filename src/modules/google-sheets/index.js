require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const app = require('@helpers/http')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()

const parseIntents = require('./parse-intents')
const listIntents = require('./list-intents')
const deleteIntents = require('./delete-intents')
const createIntents = require('./create-intents')

if (process.env.GOOGLE_SHEETS_USERS) router.use(basicAuth({
	users: JSON.parse(process.env.GOOGLE_SHEETS_USERS || '{}'),
	unauthorizedResponse: () => 'Você não tem autorização para utilizar este servidor'
}))

router.post('/dialogflow/syncIntents', async (req, res) => {
	try {
		const startTime = Date.now()
		let { data, sheetID } = req.body
		sheetID = sheetID || Math.floor(Math.random() * 9999).toString()

		const intents = parseIntents(data, sheetID)
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