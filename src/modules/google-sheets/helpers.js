// Este arquivo contém funções que podem ajudar em várias situações

/**
 * Retorna true se a string contém uma das expressões (strings)
 * @param {string} string - Frase ou palavra original
 * @param {string[]} expressions - Expressões para pesquisar
 * @returns {boolean} - Contém ou não a expressão
 * 
 * @example
 * includes('Textos 123', ['texto', 'text', 'palavras']) // true
 * includes('Textos 123', ['resposta', 'response']) // false
 */
function includes(string, expressions) {
	if (!Array.isArray(expressions)) expressions = [expressions]
	return expressions.some((expression) => {
		return string.includes(expression)
	})
}

/**
 * Agrupa respostas do mesmo tipo (text; chips)
 * @example
 * [
 *   { type: 'text', text: ['Oi'] },
 *   { type: 'text_variation', text: 'Olá' },
 *   { type: 'text_variation', text: 'Hello' },
 * ]
 * // Retorna:
 * [
 *   { type: 'text', text: ['Oi', 'Olá', 'Hello'] },
 * ]
 * 
 * @example
 * [
 *   { type: 'chips', options: [{ text: 'Oi' }] },
 *   { type: 'chips', options: [{ text: 'Olá' }] },
 *   { type: 'chips', options: [{ text: 'Hello' }] },
 * ]
 * // Retorna:
 * [
 *   { type: 'chips', options: { text: 'Oi' } },
 *   { type: 'chips', options: { text: 'Olá' } },
 *   { type: 'chips', options: { text: 'Hello' } },
 * ]
 */
function groupSameTypeResponses(responses) {
	for (const [i, originalResponse] of Object.entries(responses)) {
		if (!originalResponse) continue
		if (originalResponse.type === 'text') {
			// text; text_variation
			for (let j = parseInt(i) + 1; j < responses.length; j++) {
				const response = responses[j]
				if (!response) continue
				if (response.type !== 'text_variation') break
				originalResponse.text.push(response.text)
				responses[j] = null
			}
		} else if (originalResponse.type === 'chips') {
			// chips
			for (let j = parseInt(i) + 1; j < responses.length; j++) {
				const response = responses[j]
				if (!response) continue
				if (response.type !== 'chips') break
				originalResponse.options.push(response.options[0])
				responses[j] = null
			}
		}
	}

	// Remove respostas inválidas
	responses = responses.filter(_ => _)
	return responses
}

module.exports = { includes, groupSameTypeResponses }