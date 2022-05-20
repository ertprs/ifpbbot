require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const app = require('@helpers/http')
const express = require('express')
const router = express.Router()
router.use(express.static(__dirname + '/public'))
app.use('/', router)

const PORT = process.env.PORT || 443
log('greenBright', 'Site')(`Servidor aberto na porta ${PORT}`)

module.exports = router