const parseIntentTypes = require('./parse-intent-types')
const { groupSameTypeResponses } = require('./helpers')

/**
 * Retorna um array de intenções no formato do IFPBBot
 * Veja o arquivo: /src/dialogflow/README.md
 */
function parseIntents(data, sheetID) {
	// Número de intenções sem nome
	let unnamedCount = 0

	const headers = data[0] // Primeira linha da planilha
	const lines = data.slice(1) // Restante das linhas

	// As intenções serão adicionadas aqui
	let intents = []

	for (const line of lines) {
		// Intenção
		const intent = {
			displayName: null, // Nome da intenção
			trainingPhrases: [], // Frases de treinamento
			messages: [] // Respostas
		}

		for (const [i, cellValue] of Object.entries(line)) {
			// Se não houver nada na célula, ignora
			if (!cellValue) continue

			// Deixa o texto minúsculo, sem números, caracteres especiais, acentos, etc.
			const columnName = headers[i]
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.replace(/[0-9]/g, '')
				.replace(/[^\w\s]/gi, '')
				.trim()

			// Converte os dados do formato de texto para objeto
			// Veja o arquivo: /src/dialogflow/README.md
			parseIntentTypes(intent, columnName, cellValue)
		}

		// Adiciona prefixo no nome e remove frases vazias
		intent.displayName = intent?.displayName?.trim() || '~.' + (++unnamedCount).toString().padStart(3, 0)
		intent.displayName = `~${sheetID}.` + intent?.displayName
		intent.trainingPhrases = intent?.trainingPhrases?.filter(a => a.trim())

		// Agrupa respostas com suas variações
		// Veja a função "groupSameTypeResponses" do arquivo "helpers.js"
		intent.messages = groupSameTypeResponses(intent?.messages)

		// Insere a intenção no array "intents"
		intents.push(intent)
	}

	return intents
}

module.exports = parseIntents