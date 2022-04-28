const log = require('@helpers/logger')

/**
 * Retorna todas as intenções da planilha
 */
function processIntents(data) {
	let unnamedCount = 0

	const intents = []
	for (const rawIntent of data) {
		const intent = {
			name: '',
			trainingPhrases: [],
			responses: []
		}

		// Seleciona os dados pelas colunas
		for (const key in rawIntent) {
			if (key.toLowerCase().includes('nome')) {
				intent.name = rawIntent[key].trim()
			} else if (key.toLowerCase().includes('pergunta')) {
				intent.trainingPhrases.push(...rawIntent[key].split('\n'))
			} else if (key.toLowerCase().includes('resposta')) {
				if (rawIntent[key].startsWith('!')) {
					intent.responses.push(...rawIntent[key].substr(1).split('\n'))
				} else {
					intent.responses.push(rawIntent[key])
				}
			}
		}

		// Adiciona prefixo no nome e remove frases e respostas vazias
		intent.name = intent.name.trim() || '~.' + (++unnamedCount).toString().padStart(3, 0)
		intent.name = '~planilha.' + intent.name
		intent.trainingPhrases = intent.trainingPhrases.filter(a => a.trim())
		intent.responses = intent.responses.filter(a => a.trim())

		// Exclui se não possui frases de treinamento e respostas
		if (!intent.trainingPhrases.length && !intent.responses.length) continue

		intents.push(intent)
	}

	log('cyan', 'Planilhas Google', true)(`${intents.length} intents importadas da planilha`)
	return intents
}

module.exports = processIntents