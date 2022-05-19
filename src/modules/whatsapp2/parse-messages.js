const log = require('@helpers/logger')
const { optionsList, generateVCard } = require('@helpers/parse-messages-helpers')

/**
 * Retorna as respostas formatadas para a biblioteca Baileys
 * 
 * @param {object[]} responses - Respostas do Dialogflow
 * @param {object[]} originalMsg - Mensagem do Baileys
 * @returns {object[]} Array com objetos do Baileys
 */
function parseMessages(responses, originalMsg) {
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
			.map(r => parseResponse(r, originalMsg))
			.filter(msg => msg)
	} catch (err) {
		// Erro ao analisar mensagens
		log('redBright', 'WhatsApp')('Erro ao analisar mensagens:', err, responses)
		return [{ content: '🐛 _Desculpe! Ocorreu um erro ao analisar as mensagens_' }]
	}
}

/**
 * Converte uma resposta para o formato da biblioteca Baileys
 * 
 * @param {object} msg - Mensagem de resposta do Dialogflow
 * @param {object[]} originalMsg - Mensagem do Baileys
 * @returns {string|Buttons|MessageMedia} Respostas da biblioteca
 */
function parseResponse(msg, originalMsg) {
	try {
		switch (msg.type.toLowerCase().trim()) {
			case 'text':
				return {
					text: msg.text
				}
			case 'chips':
				return {
					text: msg.imageURL ? undefined : msg.prompt || '​',
					caption: msg.imageURL ? msg.prompt || '​' : undefined,
					footer: msg.footer,
					image: msg.imageURL ? { url: msg.imageURL } : undefined,
					buttons: msg.options.map((opt) => ({
						buttonId: Math.floor(Math.random() * 9999999).toString(),
						buttonText: { displayText: opt.text },
						type: 1
					})),
					headerType: 1
				}
			case 'image':
				return {
					image: { url: msg.rawUrl },
					caption: msg.caption || msg.accessibilityText
				}
			case 'file':
				return {
					document: { url: msg.url },
					fileName: msg.name || ('arquivo-' + new Date().toISOString())
				}
			case 'contact':
				return {
					contacts: {
						displayName: msg.name,
						contacts: [{ vcard: generateVCard(msg) }]
					}
				}
			case 'accordion':
				return {
					text: `*${msg.title}*\n────────────────────\n${msg.text}`
				}
			case 'option_list':
				return !process.env.WHATSAPP_LISTS ? optionsList(msg) : {
					title: msg.title,
					text: msg.body || '​',
					footer: msg.footer,
					buttonText: msg.buttonText || 'Lista',
					sections: msg.sections || []
				}
			case 'template_buttons': {
				let i = 0
				msg.templateButtons = msg.templateButtons.map((button) => {
					button.index = ++i
					if (button.quickReplyButton) {
						button.quickReplyButton.id = Math.floor(Math.random() * 9999999).toString()
					}
					return button
				})
				return {
					text: msg.text,
					footer: msg.footer,
					templateButtons: msg.templateButtons
				}
			}
			case 'sticker':
				return {
					sticker: { url: msg.url }
				}
			case 'reaction':
				return {
					react: {
						text: msg.emoji,
						key: originalMsg.key
					}
				}
			default:
				return null
		}
	} catch (err) {
		// Erro ao enviar mensagem
		log('redBright', 'WhatsApp')('Erro ao analisar mensagem:', err, msg)
		return { text: '🐛 _Ocorreu um erro ao enviar esta mensagem_' }
	}
}

module.exports = parseMessages