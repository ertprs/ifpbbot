require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const app = require('@config/http')
const express = require('express')
const router = express.Router()
router.use(express.static(__dirname + '/public'))

router.get('/', (req, res) => {
	res.send(`
<!DOCTYPE html>
<html>

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width">
	<title>IFPB Picuí ChatBot</title>
	<link rel="stylesheet" href="index.css">
	<link rel="shortcut icon" href="favicon.png" type="image/png">
</head>

<body>
	<script src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"></script>
	<df-messenger chat-icon="logo.png" chat-title="IFPB Picuí ChatBot" agent-id="${process.env.AGENT_ID}"
		language-code="pt-br" expand="true" intent="WELCOME"></df-messenger>
	<script src="index.js"></script>
</body>

</html>
	`)
})

app.use('/', router)

const PORT = process.env.PORT || 443
log('greenBright', 'Site')(`Servidor aberto na porta ${PORT}`)

module.exports = router