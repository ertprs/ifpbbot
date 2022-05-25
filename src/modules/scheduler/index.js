require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const { isDisabled, schedule } = require('@helpers/helpers')
const Schedule = require('@models/Schedule')
const sendFunctions = []

// Adiciona a função de agendamento do WhatsApp
if (!isDisabled(process.env.DISABLE_WHATSAPP)) {
	const exportObj = require('@modules/whatsapp')
	const parseMessages = require('@modules/whatsapp/parse-messages')
	sendFunctions.push(async (messages, chats) => {
		const parsedMessages = parseMessages(messages)
		for (const chat of chats) {
			if (chat.type !== 'whatsapp') continue
			for (const message of parsedMessages) {
				await (
					exportObj.client?.sendMessage(chat.id, message) || Promise.reject(new Error('Cliente do WhatsApp não inicializado'))
				).catch((err) => {
					log('redBright', 'Agendamento')('Falha ao enviar mensagem para o WhatsApp', chat, err)
				})
			}
		}
	})
}

// Adiciona a função de agendamento do Telegram
if (!isDisabled(process.env.DISABLE_TELEGRAM)) {
	const bot = require('@modules/telegram')
	const parseMessages = require('@modules/telegram/parse-messages')
	sendFunctions.push(async (messages, chats) => {
		for (const chat of chats) {
			if (chat.type !== 'telegram') continue
			parseMessages(messages, bot.telegram, chat.id).catch((err) => {
				log('redBright', 'Agendamento')('Falha ao enviar mensagens para o Telegram', chat, err)
			})
		}
	})
}

// TODO: adicionar agendamentos dinamicamente sem precisar reiniciar o servidor
Schedule.find({ status: 'waiting' }).then((schedules) => {
	if (schedules.length) log('greenBright', 'Agendamento')(`Agendando ${schedules.length} mensagens`)

	for (const scd of schedules) {
		const scheduleFn = async () => {
			for (sendFn of sendFunctions) {
				await sendFn(scd.messages, scd.specificChats).catch((err) => {
					log('redBright', 'Agendamento')('Falha ao enviar mensagens', sendFn, err)
				})
			}
			scd.status = 'done'
			scd.receivers = 0 // TODO: calcular isto
			scd.save()
		}

		schedule(scd.date, scheduleFn)
	}
})