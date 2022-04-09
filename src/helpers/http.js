const express = require('express')
const app = express()

app.listen(process.env.PORT || 443)

module.exports = app