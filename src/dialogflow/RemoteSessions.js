const log = require('@helpers/logger')
require('@helpers/database')

class RemoteSessions {
	constructor(saveTime = 30000) {
		this.Data = require('@models/Data')
		this.data = {}
		this.saveInterval = saveTime
		this.load()
		if (saveTime) setInterval(this.save.bind(this), saveTime)
	}

	load() {
		this.Data.findOne({ type: 'sessions' }).then((sessions) => {
			if (sessions) Object.assign(this.data, sessions.data)
			log('greenBright', 'Sessões')('Sessões do banco de dados carregadas com sucesso')
		}).catch((err) => {
			log('redBright', 'Sessões')('Não foi possível carregar as sessões pelo banco de dados', err)
		})
	}

	save() {
		this.Data.findOne({ type: 'sessions' }).then((sessions) => {
			if (sessions) {
				sessions.data = this.data
				return sessions.save()
			} else {
				return this.Data.create({ type: 'sessions', data: this.data })
			}
		}).catch((err) => {
			log('redBright', 'Sessões', true)('Não foi possível salvar as sessões no banco de dados', err)
		})
	}

	getSession(name) {
		return this.data[name]
	}

	setSession(name, value) {
		return this.data[name] = value
	}
}

module.exports = RemoteSessions