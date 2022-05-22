/**
 * Retorna um item aleatório de um array
 */
function randomItem(list = []) {
	return list[Math.floor(Math.random() * list.length)]
}

/**
 * Retorna false se a string indica que não é para desabilitar
 */
function isDisabled(string) {
	const DISABLED_STRINGS = ['false', 'no', '0', '']
	return !!(string && !DISABLED_STRINGS.includes(string))
}

/**
 * Converte uma string em JSON caso seja válida
 */
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
 * Transforma um array de chunks em outro array de chunks
 * 
 * @example
 * [ [1, 2, 3, 4], [5, 6, 7, 8, 9] ] // chunkSize = 3
 * [[ [1,2,3] ], [ [4],[5,6] ], [ [7,8,9] ]]
 */
function splitArrayChunksIntoChunks(arr, chunkSize) {
	const sizes = arr.map(a => a.length)
	const fullsize = sizes.reduce((a,b) => a+b, 0)
	
	const result = []
	let chunk = [[]]
	let currentArray = 0
	let currentArrayIndex = 0

	for (let i = 0; i < fullsize; i += chunkSize) {
		for (let j = 0; j < chunkSize; j++) {
			if (!arr[currentArray][currentArrayIndex]) {
				currentArray++
				if (currentArray >= arr.length) break
				currentArrayIndex = 0
				chunk.push([])
			}
			chunk.at(-1).push(arr[currentArray][currentArrayIndex])
			currentArrayIndex++
		}
		result.push(chunk)
		chunk = [[]]
	}

	return result
}

/**
 * Aguarda um tempo para resolver a Promise
 */
async function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time))
}

module.exports = {
	randomItem,
	isDisabled,
	jsonParse,
	splitArrayChunksIntoChunks,
	sleep
}