require('dotenv/config')
require('module-alias/register')
const log = require('@helpers/logger')
const app = require('@helpers/http')
const express = require('express')
const router = express.Router()
router.use(express.static(__dirname + '/public'))
app.use('/', router)

log('greenBright', 'Site')('Servidor aberto')

module.exports = router