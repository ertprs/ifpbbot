const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	name: { type: String, required: true },
	subject: { type: String, required: true }
})

module.exports = mongoose.model('Teacher', schema)