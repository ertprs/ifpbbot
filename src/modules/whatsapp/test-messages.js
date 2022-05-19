/**
 * Cria um servidor para testes de WhatsApp
 * @param {object} client - Cliente do Baileys
 * @param {string} chatID - ID do seu prório chat
 */
module.exports = (client, chatID = '') => {
	const express = require('express')
	const router = express.Router()
	const app = require('@helpers/http')
	const log = require('@helpers/logger')
	const getDFResponse = require('@dialogflow/get-df-response')
	const parseMessages = require('./parse-messages')
	const path = require('path')

	router.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'test-messages.html'))
	})

	router.post('/send', async (req, res) => {
		res.redirect('/whatsapp')

		const messageText = req.body.message
		const message = await client.sendMessage(chatID, { text: `*(VOCÊ)*\n${messageText}` }).catch(console.error)

		// Retorna a resposta do DialogFlow
		getDFResponse(messageText, chatID, 'whatsapp-test')
			.then((r) => parseMessages(r, message))
			.then((m) => sendMessages(m, client, message))
			.catch((e) => error(e, chatID))
	})

	app.use('/whatsapp', router)

	const PORT = process.env.PORT || 443
	log('greenBright', 'WhatsApp')(`Servidor de testes aberto na porta ${PORT} na rota /whatsapp`)

	// Envia as mensagens
	async function sendMessages(parsedMessages, client, msg) {
		for (const parsedMessage of parsedMessages) {
			// Envia a resposta
			await client.sendMessage(msg?.key?.remoteJid, parsedMessage).catch(console.error)
		}
	}

	// Executa caso ocorra algum erro
	function error(err, id) {
		console.error(err)
		client.sendMessage(id, `*OCORREU UM ERRO*\n\n${err}`).catch(console.error)
	}
}