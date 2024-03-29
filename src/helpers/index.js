/** Retorna um item aleatório de um array */
function randomItem(list = []) {
	return list[Math.floor(Math.random() * list.length)]
}

/** Retorna false se a string indica que não é para desabilitar */
function isDisabled(string) {
	const DISABLED_STRINGS = ['false', 'no', '0', '']
	return !!(string && !DISABLED_STRINGS.includes(string))
}

/** Converte uma string em JSON caso seja válida */
function jsonParse(text, reviver, defaultValue = {}, noDefaultValue = false) {
	if (noDefaultValue) defaultValue = undefined
	if (typeof text === 'object' && text !== null) {
		return text || defaultValue
	} else {
		try {
			return JSON.parse(text, reviver) || defaultValue
		} catch {
			return defaultValue
		}
	}
}

/**
 * Executa uma função em uma determinada data e horário
 * @param {Date} date - Data que a função será executada
 * @param {Function} fn - Função que será executada
 * @param {Boolean} runLate - Executa a função se já tiver passado do tempo
 */
function schedule(date, fn = () => { }, runLate = false) {
	let timeLeft = date - new Date()
	if (!runLate && timeLeft < 0) return false
	if (runLate && timeLeft < 0) timeLeft = 0
	return setTimeout(fn, timeLeft)
}

module.exports = {
	randomItem,
	isDisabled,
	jsonParse,
	schedule
}