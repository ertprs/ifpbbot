const axios = require('axios')
const simpleEncryptor = require('simple-encryptor')
const { RESTDB_DATABASE: db, RESTDB_COLLECTION: collection, RESTDB_APIKEY: key, COLLECT_KEY: encKey } = process.env

function collect(message, from, responses, platform) {
	try {
		if (!db || !collection || !key || !encKey || encKey.length < 16) return false
		const encrypt = simpleEncryptor(encKey).encrypt

		const url = `https://${db}.restdb.io/rest/${collection}`
		const data = { data: encrypt({ message, from, responses, platform })}
		const headers = { headers: { 'x-apikey': key } }
		return axios.post(url, data, headers)
			.then(() => { })
			.catch(() => { })
	} catch {}
}

module.exports = collect