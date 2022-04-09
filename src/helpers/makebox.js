/**
 * Constrói uma caixa em volta de um texto
 * @param {string} text - Texto a ser exibido
 * @param {function} [textTransformFn] - Função para transformar texto (por exemplo: colorir texto)
 * @param {function} [borderTransformFn] - Função para transformar borda (por exemplo: colorir borda)
 * @param {Object} [options] - Opções para construção da caixa
 * @param {boolean} [options.thin=false] - Usar linhas finas para contrução da caixa
 * @param {boolean} [options.center=false] - Centralizar texto dentro da caixa
 * @param {string} [options.before=' '] - String antes de cada linha da caixa (por exemplo: espaços)
 * @returns {string} Texto dentro da caixa
 */
module.exports = function (
	text,
	textTransformFn,
	borderTransformFn,
	options = {}
) {
	const thin = options.thin || false
	const center = options.center || false
	const before = options.before || ' '

	// Caracteres da caixa
	const BOX_CHARS_THIN = ['─', '│', '┌', '┐', '└', '┘']
	const BOX_CHARS_THICK = ['━', '┃', '┏', '┓', '┗', '┛']
	const CHARS = thin ? BOX_CHARS_THIN : BOX_CHARS_THICK

	// Funções de transformação
	if (!(typeof textTransformFn === 'function')) textTransformFn = _ => _
	if (!(typeof borderTransformFn === 'function')) borderTransformFn = _ => _

	// Divide as linhas
	let lines = text.split('\n')
	const maxLen = Math.max(...(lines.map(l => l.length)))

	// Constrói a caixa
	let result = before
	result += borderTransformFn(CHARS[2] + CHARS[0].repeat(maxLen + 2) + CHARS[3]) + '\n'
	for (const line of lines) {
		result += before + borderTransformFn(CHARS[1]) + ' '
		if (center) result += textTransformFn(line.padStart((line.length + maxLen) / 2).padEnd(maxLen))
		else result += textTransformFn(line.padEnd(maxLen))
		result += ' ' + borderTransformFn(CHARS[1]) + '\n'
	}
	result += before + borderTransformFn(CHARS[4] + CHARS[0].repeat(maxLen + 2) + CHARS[5])
	return result
}