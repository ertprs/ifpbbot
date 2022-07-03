const log = require('@logger')
const fs = require('fs')
const { jsonParse } = require('@helpers')

class LocalSessions {
	constructor(fileName, data, saveTime = 10000) {
		this.data = data || {}
		this.fileName = fileName
		if (fileName) this.load()
		if (saveTime) this.saveInterval = setInterval(this.save.bind(this), saveTime)
	}

	load(fileName = this.fileName) {
		try {
			if (!fs.existsSync(fileName)) return false

			const data = fs.readFileSync(fileName, { encoding: 'UTF-8' })
			const result = jsonParse(data)

			if (typeof result === 'object' && result !== null && !Array.isArray(result)) {
				log('greenBright', 'Sessões')('Sessões do arquivo carregadas com sucesso')
				this.data = result
				return result
			} else {
				throw new Error('O conteúdo do arquivo da sessão é inválido')
			}
		} catch (err) {
			log('redBright', 'Sessões')('Não foi possível carregar as sessões pelo arquivo', err)
		}
	}

	save(fileName = this.fileName) {
		fs.writeFile(fileName, JSON.stringify(this.data), (err) => {
			if (err) log('redBright', 'Sessões')('Ocorreu um erro ao salvar sessão', err)
		})
	}

	getSession(name) {
		return this.data[name]
	}

	setSession(name, value) {
		return this.data[name] = value
	}
}

module.exports = LocalSessions