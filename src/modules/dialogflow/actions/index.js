const log = require('@logger')

const actions = {
	'feedback': tryRequire('./feedback')
}

async function runAction(response, { from, platform, text }) {
	const action = actions[response.queryResult.action]
	
	if (typeof action !== 'function') {
		return null
	}

	try {
		return action(response, { from, platform, text })?.catch?.((err) => {
			log('redBright', 'Dialogflow ações')(`Erro ao executar a ação "${response.queryResult.action}"`, err)
		})
	} catch (err) {
		log('redBright', 'Dialogflow ações')(`Erro ao executar a ação "${response.queryResult.action}"`, err)
		return false
	}
}

function tryRequire(path) {
	try {
		return require(path)
	} catch (err) {
		log('redBright', 'Dialogflow ações')(`Erro ao importar a ação "${path}"`, err)
		return () => {}
	}
}

module.exports = runAction