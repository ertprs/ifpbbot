const Professor = require('@models/Professor')
const random = require('@helpers/random')
const log = require('@helpers/logger')

module.exports = function (professor) {
	if (process.env.NODE_ENV === 'development') {
		log('Webhook')(`Consultando as disciplinas de ${professor}...`)
	}

	return Professor.findAll({
		where: { nome: professor }
	}).then((resultados) => {
		if (resultados.length === 0) {
			if (process.env.NODE_ENV === 'development') {
				log('Webhook')(`Nenhuma disciplina encontrada para ${professor}`)
			}
			return '❌ As disciplinas deste professor não foram encontrados no banco de dados'
		} else {
			const disciplinas = resultados.map(resultado => resultado.disciplina).join(', ')
			if (process.env.NODE_ENV === 'development') {
				log('Webhook')(`As disciplinas de ${professor} são: ${disciplinas}`)
			}

			return random([
				`${professor} é o professor de *${disciplinas}*`,
				`${professor} ensina *${disciplinas}*`,
				`${professor} ministra *${disciplinas}*`
			])
		}
	}).catch((err) => {
		if (process.env.NODE_ENV === 'development') {
			log('Webhook')('Ocorreu um erro\n' + err)
		}
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}