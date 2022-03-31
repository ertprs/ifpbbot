require('dotenv/config')
require('module-alias/register')
const log = require('@helpers/logger')
const app = require('@helpers/http')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()

if (!process.env.SHEETDB_API) {
	log('redBright', 'Erro')('Chave de API do SheetDB faltando')
	log('magenta', 'Erro')('Inclua a chave de API do SheetDB na variável de ambiente SHEETDB_API')
	throw new Error('Chave de API do SheetDB faltando')
}

const getIntentsFromSheet = require('./getIntentsFromSheet')
const listIntents = require('./listIntents')
const deleteIntents = require('./deleteIntents')
const createIntents = require('./createIntents')

if (process.env.GOOGLE_SHEETS_USERS) router.use(basicAuth({
	users: JSON.parse(process.env.GOOGLE_SHEETS_USERS || '{}'),
	unauthorizedResponse: () => 'Você não tem autorização para utilizar este servidor'
}))

router.get('/updateDialogflow', async (req, res) => {
	try {
		const startTime = Date.now()

		const newIntents = await getIntentsFromSheet()
		const currentIntents = await listIntents()
		await deleteIntents(currentIntents)
		await createIntents(newIntents)

		res.json({
			success: true,
			addedIntents: newIntents.length,
			removedIntents: currentIntents.length,
			time: Date.now() - startTime
		})
	} catch (err) {
		res.json({ success: false })
		log('redBright', 'Erro')('Erro ao inserir dados das Planilhas Google\n' + err)
	}
})

app.use('/googleSheets', router)

log('greenBright', 'Planilhas Google')('Servidor aberto')

module.exports = router