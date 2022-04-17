const Professor = require('@models/Professor')
const { randomItem: random } = require('@helpers/helpers')
const log = require('@helpers/logger')

module.exports = function (disciplina) {
	log('cyan', 'Webhook', true)(`Consultando os professores de ${disciplina}...`)

	return Professor.findAll({
		where: { disciplina: disciplina }
	}).then((resultados) => {
		if (resultados.length === 0) {
			log('cyan', 'Webhook', true)(`Nenhum professor encontrado para ${disciplina}`)
			return '❌ Os professores desta disciplina não foram encontrados no banco de dados'
		} else {
			const professores = resultados.map(resultado => resultado.nome).join(', ')
			log('cyan', 'Webhook', true)(`Os professores de ${disciplina} são: ${professores}`)

			return random([
				`A disciplina ${disciplina} é ministrada por *${professores}*`,
				`*${professores}* ensina(m) ${disciplina}`,
				`*${professores}* ministra(m) a disciplina de ${disciplina}`
			])
		}
	}).catch((err) => {
		log('cyan', 'Webhook', true)('Ocorreu um erro', err)
		return '🐛 Desculpe! Ocorreu um erro durante a busca'
	})
}