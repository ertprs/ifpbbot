/**
 * Converte uma mensagem do tipo option_list para texto comum
 * @param {object} msg - Mensagem do Dialogflow
 * @returns {string} Mensagem no formato de texto
 */
function optionsList(msg) {
	let text = ''
	if (msg.title) text += `*${msg.title}*\n`
	if (msg.body) text += '\n' + msg.body + '\n'

	for (const section of msg.sections) {
		text += '\n───────────────\n'
		text += `*${section.title}*\n`

		for (const row of section.rows) {
			text += `\n• ${row.title}`
			if (row.description) text += `\n_${row.description}_`
		}
	}

	if (msg.footer) {
		text += '\n───────────────\n'
		text += `\n_${msg.footer}_`
	}

	return text.trim()
}

function generateVCard({ name, phone, email }) {
	let vCard = 'BEGIN:VCARD\n'
	vCard += 'VERSION:3.0\n'
	if (name) vCard += `FN:${name}\n`
	if (phone) vCard += `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}\n` // WhatsApp ID + phone number
	if (email) vCard += `EMAIL;type=HOME,INTERNET:${email}\n`
	vCard += 'END:VCARD'
	return vCard
}

module.exports = {
	optionsList,
	generateVCard
}