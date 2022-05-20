require('dotenv/config')
require('module-alias/register')
const getSubjects = require('./intents/getSubjects')
const getTeachers = require('./intents/getTeachers')
const log = require('@logger')
const app = require('@helpers/http')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()
require('@helpers/database')

if (process.env.WEBHOOK_USERS) router.use(basicAuth({
	users: JSON.parse(process.env.WEBHOOK_USERS || '{}'),
	unauthorizedResponse: () => 'Você não tem autorização para utilizar este servidor Webhook'
}))

router.post('/', async (req, res) => {
	switch (req.body.queryResult.intent.displayName) {
		case 'disciplinas.qual_disciplina_do_professor': {
			const response = await getSubjects(req.body.queryResult.parameters.professor)
			res.json({
				fulfillmentMessages: [{
					text: { text: [response] }
				}]
			})
		} break

		case 'disciplinas.qual_professor_da_disciplina': {
			const response = await getTeachers(req.body.queryResult.parameters.disciplina)
			res.json({
				fulfillmentMessages: [{
					text: { text: [response] }
				}]
			})
		} break

		default: {
			res.sendStatus(404)
		}
	}
})

app.use('/webhook', router)

const PORT = process.env.PORT || 443
log('greenBright', 'Webhook')(`Servidor aberto na porta ${PORT} na rota /webhook`)

module.exports = router