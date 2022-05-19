const { Buttons, List, MessageMedia } = require('whatsapp-web.js')
const log = require('@helpers/logger')
const { optionsList } = require('@helpers/parse-messages-helpers')

/**
 * Retorna as respostas formatadas para a biblioteca whatsapp-web.js
 * 
 * @param {object[]} responses - Respostas do Dialogflow
 * @param {Client} client - Cliente da biblioteca 
 * @returns {object[]} Array com objetos do whatsapp-web.js
 */
function parseMessages(responses, client) {
	try {
		for (const i in responses) {
			const msg = responses[i]

			// Remove as respostas com o parâmetro "ignoreWhatsApp"
			if (msg.ignoreWhatsApp || msg.ignoreWhatsapp || msg.ignorewhatsapp || msg.ignorewhatsApp) {
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
		log('cyan', 'WhatsApp', true)(responses)

		// Converte as respostas para o formato da biblioteca WhatsApp Web JS
		return responses
			.flat()
			.filter(msg => msg)
			.map(r => parseResponse(r, client))
			.filter(msg => msg)
	} catch (err) {
		// Erro ao analisar mensagens
		log('redBright', 'WhatsApp')('Erro ao analisar mensagens:', err, responses)
		return [{ content: '🐛 _Desculpe! Ocorreu um erro ao analisar as mensagens_' }]
	}
}

/**
 * Converte uma resposta para o formato da biblioteca whatsapp-web.js
 * 
 * @param {object} msg - Mensagem de resposta do Dialogflow
 * @param {Client} client - Cliente da biblioteca
 * @returns {string|Buttons|MessageMedia} Respostas da biblioteca
 */
function parseResponse(msg, client) {
	try {
		switch (msg.type.toLowerCase().trim()) {
			case 'text': return { content: msg.text }
			case 'chips':
				return {
					content: new Buttons(
						msg.prompt || '​',
						msg.options.map(opt => ({ body: opt.text }))
					)
				}
			case 'image':
				return {
					content: MessageMedia.fromUrl(msg.rawUrl, { unsafeMime: true }).then(file => {
						file.filename = msg.accessibilityText
						return file
					})
				}
			case 'file':
				return {
					content: MessageMedia.fromUrl(msg.url, { unsafeMime: true }).then(file => {
						file.filename = msg.name || ('arquivo-' + new Date().toISOString())
						return file
					})
				}
			case 'contact':
				return { content: client.getContactById(msg.number) }
			case 'accordion':
				return { content: `*${msg.title}*\n────────────────────\n${msg.text}` }
			case 'option_list':
				return {
					content: !process.env.WHATSAPP_LISTS ? optionsList(msg) : new List(
						msg.body || '​',
						msg.buttonText || 'Lista',
						msg.sections || [],
						msg.title,
						msg.footer
					)
				}
			case 'sticker':
				return {
					content: MessageMedia.fromUrl(msg.url, { unsafeMime: true }),
					options: { sendMediaAsSticker: true }
				}
			default:
				return null
		}
	} catch (err) {
		// Erro ao enviar mensagem
		log('redBright', 'WhatsApp')('Erro ao analisar mensagem:', err, msg)
		return { content: '🐛 _Ocorreu um erro ao enviar esta mensagem_' }
	}
}

module.exports = parseMessages