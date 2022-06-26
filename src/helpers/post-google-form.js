const axios = require('axios')
const FormData = require('form-data')

function postGoogleForm(formID, fields = {}) {
	const formData = new FormData()
	for (const field in fields) {
		const value = fields[field]
		formData.append(field, value)
	}

	return axios.post(`https://docs.google.com/forms/u/0/d/e/${formID}/formResponse`, formData)
}

module.exports = postGoogleForm