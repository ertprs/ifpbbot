require('dotenv/config')
require('module-alias/register')
const { Telegraf } = require('telegraf')
const log = require('@logger')
const getDFResponse = require('@dialogflow/get-df-response')
const parseMessages = require('./parse-messages')

if (!process.env.TELEGRAM_BOT_TOKEN) {
	log('redBright', 'Erro')('Token do Telegram faltando')
	log('magenta', 'Erro')('Inclua o token do seu Bot do Telegram na variável de ambiente TELEGRAM_BOT_TOKEN')
	log('magenta', 'Erro')('ou use a variável de ambiente DISABLE_TELEGRAM para desativá-lo')
	throw new Error('Token do Telegram faltando')
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// Mensagem /start
bot.start((ctx) => {
	getDFResponse('Oi', ctx.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Nova mensagem
bot.on('text', async (ctx) => {
	ctx.replyWithChatAction('typing')
	getDFResponse(ctx.message.text, ctx.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Mensagem de voz
bot.on('voice', async (ctx) => {
	ctx.replyWithMarkdown('🤷‍♂️ Desculpe, infelizmente não consigo entender áudios')
})

// Ação de botão
bot.on('callback_query', async (ctx) => {
	ctx.answerCbQuery()
	ctx.replyWithMarkdown(`💬 *${ctx.update.callback_query.data}*`)
	getDFResponse(ctx.update.callback_query.data, ctx.update.callback_query.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Inicia o servidor
function start() {
	return bot.launch().then(() => {
		log('greenBright', 'Telegram')('Servidor aberto')
	})
}

// Servidor Webhook
if (process.env.TELEGRAM_WEBHOOK_URL) {
	const app = require('@helpers/http')
	const webhookURL = process.env.TELEGRAM_WEBHOOK_URL
	const webhookPath = new URL(process.env.TELEGRAM_WEBHOOK_URL).pathname
	bot.telegram.setWebhook(webhookURL).then((s) => !s && start())
	app.use(bot.webhookCallback(webhookPath))
	const PORT = process.env.PORT || 443
	log('greenBright', 'Telegram')(`Servidor Webhook aberto na porta ${PORT}`)
} else {
	start()
}

module.exports = bot