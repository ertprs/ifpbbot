/* eslint-disable camelcase */
const log = require('@logger')
const { optionsList, generateVCard } = require('@helpers/parse-messages-helpers')

/**
 * Converte uma resposta para o formato da biblioteca Baileys
 * @param {object} msg - Mensagem de resposta do Dialogflow
 * @param {object} originalMsg - Mensagem do Baileys
 * @returns {object} Resposta no formato da biblioteca
 */
function parseResponse(msg, originalMsg) {
	// Coloque os tipos de mensagem abaixo
	const MESSAGE_TYPES = {
		/** Texto */
		text() {
			return {
				text: msg.text
			}
		},

		/** Botões */
		chips() {
			return {
				text: msg.prompt || '​',
				footer: msg.footer,
				buttons: msg.options.map((opt) => ({
					buttonId: Math.floor(Math.random() * 9999999).toString(),
					buttonText: { displayText: opt.text },
					type: 1
				})),
				headerType: 1
			}
		},

		/** Imagem */
		image() {
			return {
				image: { url: msg.rawUrl },
				caption: msg.caption || msg.accessibilityText
			}
		},

		/** Arquivo */
		file() {
			return {
				document: { url: msg.url },
				fileName: msg.name || ('arquivo-' + new Date().toISOString())
			}
		},

		/** Contato */
		contact() {
			return {
				contacts: {
					displayName: msg.name,
					contacts: [{ vcard: generateVCard(msg) }]
				}
			}
		},

		/** Acordeão */
		accordion() {
			return {
				text: `*${msg.title}*\n────────────────────\n${msg.text}`
			}
		},

		/** Lista de opções */
		option_list() {
			return !process.env.WHATSAPP_LISTS ? optionsList(msg) : {
				title: msg.title,
				text: msg.body || '​',
				footer: msg.footer,
				buttonText: msg.buttonText || 'Lista',
				sections: msg.sections || []
			}
		},

		/** Template Buttons */
		template_buttons() {
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
		},

		/** Figurinha */
		sticker() {
			return {
				sticker: { url: msg.url }
			}
		},

		/** Reação */
		reaction() {
			return {
				react: {
					text: msg.emoji,
					key: originalMsg?.key
				}
			}
		}
	}

	return MESSAGE_TYPES[msg?.type?.toLowerCase().trim()]?.() || null
}

/**
 * Retorna as respostas formatadas para a biblioteca Baileys
 * @param {object[]} responses - Respostas do Dialogflow
 * @param {object[]} originalMsg - Mensagem do Baileys
 * @returns {object[]} Array com objetos do Baileys
 */
function parseMessages(responses, originalMsg) {
	try {
		for (const i in responses) {
			const msg = responses[i]
			if (!msg) continue

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
			if (msg.type === 'chips' && i - 1 >= 0 && responses[i - 1]?.type === 'text') {
				msg.prompt = responses[i - 1]?.text
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
		return [{ text: '🐛 _Desculpe! Ocorreu um erro ao analisar as mensagens_' }]
	}
}

module.exports = parseMessages