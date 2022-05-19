/* eslint-disable camelcase */
const { Context } = require('telegraf')
const log = require('@helpers/logger')
const { optionsList } = require('@helpers/parse-messages-helpers')

/**
 * Retorna as respostas formatadas para a biblioteca telegraf
 * 
 * @param {object[]} responses - Respostas do Dialogflow
 * @param {Context} ctx - Contexto da biblioteca 
 */
async function parseMessages(responses, ctx) {
	try {
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

		// Printa as respostas no ambiente de desenvolvimento
		log('cyan', 'Telegram', true)(responses)

		// Converte as respostas para o formato da biblioteca Telegraf
		responses = responses.flat().filter(msg => msg)
		for (const [i, response] of Object.entries(responses)) {
			await parseResponse(response, ctx, i, responses).catch((err) => {
				// Erro ao enviar mensagem
				log('redBright', 'Telegram')('Erro ao analisar mensagem:', err, response)
				ctx.replyWithMarkdown('🐛 _Ocorreu um erro ao enviar esta mensagem_')
			})
		}
	} catch (err) {
		// Erro ao analisar mensagens
		log('redBright', 'Telegram')('Erro ao analisar mensagens:', err, responses)
		ctx.replyWithMarkdown('🐛 _Desculpe! Ocorreu um erro ao analisar as mensagens_')
	}
}

/**
 * Converte uma resposta para o formato da biblioteca telegraf
 * @param {object} msg - Mensagem de resposta do Dialogflow
 * @param {Context} ctx - Contexto da biblioteca
 */
async function parseResponse(msg, ctx, i, responses) {
	const isGroup = ctx.chat.type.includes('group')
	const forceReply = isGroup ? { force_reply: true, input_field_placeholder: 'Responda ao ChatBot', selective: true } : {}
	const replyMarkup = isGroup ? { reply_markup: { ...forceReply }, reply_to_message_id: ctx.message?.message_id } : undefined

	switch (msg.type.toLowerCase().trim()) {
		case 'text':
			if (msg.text) await ctx.replyWithMarkdown(msg.text, replyMarkup)
			break
		case 'chips':
			await ctx.replyWithMarkdown(msg.prompt || 'Selecione uma opção:', {
				reply_markup: {
					...forceReply,
					inline_keyboard: msg.options.map((opt) => [{
						text: opt.text, callback_data: opt.text
					}])
				}
			})
			break
		case 'image':
			await ctx.replyWithPhoto(msg.rawUrl, replyMarkup)
			break
		case 'file':
			await ctx.replyWithDocument(msg.url, replyMarkup)
			break
		case 'contact':
			await ctx.replyWithContact(msg.phone, msg.name, replyMarkup)
			break
		case 'accordion':
			await ctx.replyWithMarkdown(`*${msg.title}*\n────────────────────\n${msg.text}`, replyMarkup)
			break
		case 'option_list':
			await ctx.replyWithMarkdown(optionsList(msg), replyMarkup)
			break
		case 'sticker':
			await ctx.replyWithSticker(msg.url)
			break
		default:
			break
	}
}

module.exports = parseMessages