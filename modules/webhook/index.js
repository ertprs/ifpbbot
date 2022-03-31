require('dotenv/config')
require('module-alias/register')
const getDisciplinas = require('./intents/getDisciplinas')
const getProfessores = require('./intents/getProfessores')
const log = require('@helpers/logger')
const app = require('@helpers/http')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()
router.use(express.json())

if (process.env.WEBHOOK_USERS) router.use(basicAuth({
	users: JSON.parse(process.env.WEBHOOK_USERS || '{}'),
	unauthorizedResponse: () => 'Você não tem autorização para utilizar este servidor Webhook'
}))

router.post('/', async (req, res) => {
	switch (req.body.queryResult.intent.displayName) {
		case 'disciplinas.qual_disciplina_do_professor': {
			const resposta = await getDisciplinas(req.body.queryResult.parameters.professor)
			res.json({
				fulfillmentMessages: [{
					text: { text: [resposta] }
				}]
			})
		} break

		case 'disciplinas.qual_professor_da_disciplina': {
			const resposta = await getProfessores(req.body.queryResult.parameters.disciplina)
			res.json({
				fulfillmentMessages: [{
					text: { text: [resposta] }
				}]
			})
		} break

		default: {
			res.sendStatus(404)
		}
	}
})

app.use('/webhook', router)
log('greenBright', 'Webhook')('Servidor aberto')

module.exports = router