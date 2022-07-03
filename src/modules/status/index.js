require('dotenv/config')
require('module-alias/register')
const app = require('@config/http')
const { jsonParse } = require('@helpers')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()
const modules = require('@@/modules')

router.use(basicAuth({
	users: jsonParse(process.env.STATUS_USERS),
	challenge: true,
	unauthorizedResponse: () => '401 Unauthorized'
}))

router.use(express.static(__dirname + '/public'))

router.get('/data', (req, res) => {
	res.send({ modules })
})

app.use('/status', router)

const PORT = process.env.PORT || 443

module.exports = router