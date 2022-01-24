require('dotenv/config')
require('module-alias/register')
const { Telegraf, Markup } = require('telegraf')
const getDFResponse = require('@dialogflow/get-df-response')
const parseMessages = require('./parse-messages')

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

// Mensagem /start
bot.start((ctx) => {
	getDFResponse('Oi', ctx.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Nova mensagem
bot.on('text', async (ctx) => {
	getDFResponse(ctx.message.text, ctx.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Ação de botão
bot.on('callback_query', async (ctx) => {
	ctx.answerCbQuery()
	ctx.replyWithMarkdown(`💬 *[${ctx.update.callback_query.data}]*`)
	getDFResponse(ctx.update.callback_query.data, ctx.update.callback_query.message.chat.id, 'telegram')
		.then((r) => parseMessages(r, ctx))
})

// Inicia o servidor
bot.launch().then(() => console.log('[TELEGRAM] Servidor iniciado'))

// Servidor Webhook
const {
	TELEGRAM_WEBHOOK_URL: whURL,
	REPL_SLUG: rSlug,
	REPL_OWNER: rOwner,
	TELEGRAM_WEBHOOK_SECRET_PATH: whPath
} = process.env

if ((whURL || (rSlug && rOwner)) && whPath) {
	const webhookURL = whURL || `https://${rSlug}.${rOwner.toLowerCase()}.repl.co`
	bot.telegram.setWebhook(webhookURL)
	bot.startWebhook(whPath, null, 443)
}

module.exports = bot