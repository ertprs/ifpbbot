const mongoose = require('mongoose')

const schema = new mongoose.Schema({
	data: Object
})

module.exports = mongoose.model('Sessions', schema)