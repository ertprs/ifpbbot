const Teacher = require('@models/Teacher')
const { randomItem: random } = require('@helpers')
const log = require('@logger')

module.exports = (subject) => {
	log('cyan', 'Webhook', true)(`Consultando os professores de ${subject}...`)

	return Teacher.find({ subject }).then((results) => {
		if (results.length === 0) {
			log('cyan', 'Webhook', true)(`Nenhum professor encontrado para ${subject}`)
			return '❌ Os professores desta disciplina não foram encontrados no banco de dados'
		} else {
			const teachers = results.map((result) => result.name).join(', ')
			log('cyan', 'Webhook', true)(`Os professores de ${subject} são: ${teachers}`)

			return random([
				`A disciplina ${subject} é ministrada por *${teachers}*`,
				`*${teachers}* ensina ${subject}`,
				`*${teachers}* ministra a disciplina de ${subject}`
			])
		}
	}).catch((err) => {
		log('cyan', 'Webhook', true)('Ocorreu um erro', err)
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}