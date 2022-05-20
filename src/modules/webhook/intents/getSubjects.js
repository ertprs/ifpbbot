const Teacher = require('@models/Teacher')
const { randomItem: random } = require('@helpers/helpers')
const log = require('@logger')

module.exports = (teacher) => {
	log('cyan', 'Webhook', true)(`Consultando as disciplinas de ${teacher}...`)

	return Teacher.find({ name: teacher }).then((results) => {
		if (results.length === 0) {
			log('cyan', 'Webhook', true)(`Nenhuma disciplina encontrada para ${teacher}`)
			return '❌ As disciplinas deste professor não foram encontrados no banco de dados'
		} else {
			const subjects = results.map((result) => result.subject).join(', ')
			log('cyan', 'Webhook', true)(`As disciplinas de ${teacher} são: ${subjects}`)

			return random([
				`${teacher} é o professor de *${subjects}*`,
				`${teacher} ensina *${subjects}*`,
				`${teacher} ministra *${subjects}*`
			])
		}
	}).catch((err) => {
		log('cyan', 'Webhook', true)('Ocorreu um erro', err)
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}