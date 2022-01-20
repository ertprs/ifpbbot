module.exports = function (text, reviver, defaultValue = {}, noDefaultValue = false) {
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