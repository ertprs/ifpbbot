require('dotenv/config')
require('module-alias/register')
const { Telegraf, Markup } = require('telegraf')
const log = require('@helpers/logger')
const getDFResponse = require('@dialogflow/get-df-response')
const parseMessages = require('./parse-messages')

if (!process.env.TELEGRAM_BOT_TOKEN) {
	log('redBright', 'Erro')('Token do Telegram faltando')
	log('magenta', 'Erro')('Inclua o token do seu Bot do Telegram na variável de ambiente TELEGRAM_BOT_TOKEN')
	log('magenta', 'Erro')('ou use a variável de ambiente DISABLE_TELEGRAM para desativá-lo')
	throw new Error('Token do Telegram faltando')
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
log('yellowBright', 'Telegram')('Conectando, aguarde...')

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
bot.launch().then(() => {
	log('greenBright', 'Telegram')('Servidor aberto')
})

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
	bot.startWebhook(whPath, null, process.env.PORT || 443)
	log('greenBright', 'Telegram')('Servidor Webhook aberto')
}

module.exports = bot