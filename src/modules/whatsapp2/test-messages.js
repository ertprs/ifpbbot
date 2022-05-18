module.exports = (client) => {
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

		// const chatID = client && client.info && client.info.wid && client.info.wid._serialized
		const chatID = process.env.WHATSAPP2_ME // temp
		const message = req.body.message

		await client.sendMessage(chatID, { text: `*(VOCÊ)*\n${message}` }).catch(console.error)

		// Retorna a resposta do DialogFlow
		getDFResponse(message, chatID, 'whatsapp-test')
			.then((r) => parseMessages(r, client))
			.then((m) => sendMessages(m, client, chatID))
			.catch((e) => error(e, chatID))
	})

	app.use('/whatsapp', router)
	log('greenBright', 'WhatsApp')('Servidor de testes aberto')

	// Envia as mensagens
	async function sendMessages(msgs, client, chatID) {
		for (let res of msgs) {
			// Se a mensagem for uma Promise
			if (res && res.content && res.content.then) {
				res.content = await res.content.catch((err) => {
					console.error(err)
					return null
				})
			}

			// Envia apenas se a mensagem for válida
			if (res && res.content) {
				console.log(res.content)
				await client.sendMessage(chatID, { text: res.content }, res.options).catch(console.error)
			}
		}
	}

	// Executa caso ocorra algum erro
	function error(err, id) {
		console.error(err)
		client.sendMessage(id, `*OCORREU UM ERRO*\n\n${err}`).catch(console.error)
	}
}