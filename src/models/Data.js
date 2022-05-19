const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	type: String,
	data: Object
})

module.exports = mongoose.model('Data', schema)