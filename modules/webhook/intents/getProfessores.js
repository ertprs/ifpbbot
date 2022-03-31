const Professor = require('@models/Professor')
const random = require('@helpers/random')
const log = require('@helpers/logger')

module.exports = function (disciplina) {
	if (process.env.NODE_ENV === 'development') {
		log('Webhook')(`Consultando os professores de ${disciplina}...`)
	}

	return Professor.findAll({
		where: { disciplina: disciplina }
	}).then((resultados) => {
		if (resultados.length === 0) {
			if (process.env.NODE_ENV === 'development') {
				log('Webhook')(`Nenhum professor encontrado para ${disciplina}`)
			}
			return '❌ Os professores desta disciplina não foram encontrados no banco de dados'
		} else {
			const professores = resultados.map(resultado => resultado.nome).join(', ')
			if (process.env.NODE_ENV === 'development') {
				log('Webhook')(`Os professores de ${disciplina} são: ${professores}`)
			}

			return random([
				`A disciplina ${disciplina} é ministrada por *${professores}*`,
				`*${professores}* ensina(m) ${disciplina}`,
				`*${professores}* ministra(m) a disciplina de ${disciplina}`,
			])
		}
	}).catch((err) => {
		if (process.env.NODE_ENV === 'development') {
			log('Webhook')('Ocorreu um erro\n' + err)
		}
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}