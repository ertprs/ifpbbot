const Professor = require('@models/Professor')
const random = require('@helpers/random')
const log = require('@helpers/logger')

module.exports = function (professor) {
	log('cyan', 'Webhook', true)(`Consultando as disciplinas de ${professor}...`)

	return Professor.findAll({
		where: { nome: professor }
	}).then((resultados) => {
		if (resultados.length === 0) {
			log('cyan', 'Webhook', true)(`Nenhuma disciplina encontrada para ${professor}`)
			return '❌ As disciplinas deste professor não foram encontrados no banco de dados'
		} else {
			const disciplinas = resultados.map(resultado => resultado.disciplina).join(', ')
			log('cyan', 'Webhook', true)(`As disciplinas de ${professor} são: ${disciplinas}`)

			return random([
				`${professor} é o professor de *${disciplinas}*`,
				`${professor} ensina *${disciplinas}*`,
				`${professor} ministra *${disciplinas}*`
			])
		}
	}).catch((err) => {
		log('cyan', 'Webhook', true)('Ocorreu um erro', err)
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}