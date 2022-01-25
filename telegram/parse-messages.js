/* eslint-disable camelcase */
const { Context, Markup } = require('telegraf')
const log = require('@helpers/logger')

/**
 * Retorna as respostas formatadas para a biblioteca telegraf
 * 
 * @param {object[]} responses - Respostas do Dialogflow
 * @param {Context} ctx - Contexto da biblioteca 
 */
async function parseMessages(responses, ctx) {
	for (const i in responses) {
		const msg = responses[i]

		// Remove as respostas com o parâmetro "ignoreWhatsApp"
		if (msg.ignoreTelegram || msg.ignoretelegram) {
			responses[i] = null
			continue
		}

		// Converte links de Chips para texto
		if (msg.type === 'chips' && msg.options.some(o => o.link)) {
			responses[i] = msg.options.map(o => ({
				type: 'text',
				text: `*${o.text}*\n${o.link || ''}`
			}))
		}

		// Une respostas com Chips e com Texto
		if (msg.type === 'chips' && i - 1 >= 0 && responses[i - 1].type === 'text') {
			msg.prompt = responses[i - 1].text
			responses[i - 1] = null
		}
	}

	// Printa as respostas
	if (process.env.NODE_ENV === 'development') {
		log('Telegram')(responses)
	}

	// Converte as respostas para o formato da biblioteca
	responses = responses.flat().filter(msg => msg)
	for (const response of responses) {
		await parseResponse(response, ctx)
	}
}

/**
 * Converte uma resposta para o formato da biblioteca telegraf
 * 
 * @param {object} msg - Mensagem de resposta do Dialogflow
 * @param {Context} ctx - Contexto da biblioteca
 */
async function parseResponse(msg, ctx) {
	switch (msg.type) {
		case 'text':
			// if (msg.text) await ctx.replyWithMarkdown(msg.text, Markup.removeKeyboard())
			if (msg.text) await ctx.replyWithMarkdown(msg.text)
			break
		case 'chips':
			// await ctx.reply(msg.prompt, Markup.keyboard(msg.options.map(opt => opt.text)).oneTime().resize())
			await ctx.replyWithMarkdown(msg.prompt || '', {
				reply_markup: {
					inline_keyboard: msg.options.map(opt => [{
						text: opt.text, callback_data: opt.text
					}])
				}
			})
			break
		case 'image':
			await ctx.replyWithPhoto(msg.rawUrl)
			break
		case 'file':
			await ctx.replyWithDocument(msg.url)
			break
		case 'contact':
			await ctx.replyWithContact(msg.number, msg.name)
			break
		case 'accordion':
			await ctx.replyWithMarkdown(`*${msg.title}*\n────────────────────\n${msg.text}`)
			break
		default:
			break
	}
}

module.exports = parseMessages