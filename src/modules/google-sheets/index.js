require('dotenv/config')
require('module-alias/register')
const log = require('@logger')
const app = require('@helpers/http')
const { sleep, splitArrayChunksIntoChunks } = require('@helpers/helpers')
const express = require('express')
const basicAuth = require('express-basic-auth')
const router = express.Router()

const parseIntents = require('./parse-intents')
const listIntents = require('./list-intents')
const deleteIntents = require('./delete-intents')
const createIntents = require('./create-intents')

if (process.env.GOOGLE_SHEETS_USERS) router.use(basicAuth({
	users: JSON.parse(process.env.GOOGLE_SHEETS_USERS || '{}'),
	unauthorizedResponse: () => 'Você não tem autorização para utilizar este servidor'
}))

let operationsCooldown = -Infinity

/**
 * Adiciona as intents no Dialogflow
 * Recebe no corpo da requisição:
 *   sheetID  (String) - ID da planilha
 *   data     (Object) - Linhas e colunas da tabela para processar
 *   intents¹ (Array)  - Intenções processadas (opcional)
 * 
 * ¹Caso coloque um parâmetro ?parsed=1, ele irá entender que as linhas
 * e colunas já foram processadas e irá usar os dados do corpo 'intents'
 * 
 * ²O Dialogflow tem um limite de operações por minuto na sua API, então
 * dividi em pedaços (chunks) de 90 requisições cada e haverá um tempo de
 * espera de 70 segundos entre as requisições de cada chunk
 */
router.post('/dialogflow/syncIntents', async (req, res) => {
	let errors = 0 // Número de erros
	const OPERATIONS_CHUNK_SIZE = 90 // Número de operações em um chunk²
	const SLEEP_BETWEEN_CHUNKS = 70 // Tempo de espera entre chunks

	// Se estiver em cooldown retorna um erro
	if (Date.now() < operationsCooldown) return res.status(503).json({
		success: false,
		wait: operationsCooldown - Date.now()
	})

	try {
		const startTime = Date.now()
		let { data, sheetID } = req.body
		sheetID = sheetID || Math.floor(Math.random() * 9999).toString()

		const intents = req.query.parsed ? req.body.intents : parseIntents(data, sheetID) // Se houver um parâmetro ?parsed=1, usa as intents já processadas
		const currentIntents = await listIntents(sheetID) // Intents existentes desta planilha no Dialogflow
		const deleteOperations = await deleteIntents(currentIntents) // Exclui as intents existentes do Dialogflow
		const createOperations = await createIntents(intents) // Adiciona as intents novas e atualizadas no Dialogflow
		const operations = [deleteOperations, createOperations] // Todas as operações que serão realizadas na API do Dialogflow

		const operationsChunksLength = Math.ceil(operations.reduce((a,b)=> a + b.length,0) / OPERATIONS_CHUNK_SIZE) // Número de chunks de operações
		const operationsChunks = splitArrayChunksIntoChunks(operations, OPERATIONS_CHUNK_SIZE) // Chunks de operações
		operationsCooldown = Date.now() + operationsChunksLength * SLEEP_BETWEEN_CHUNKS * 1000 // Calcula o tempo que o cliente terá de esperar até a próxima requisição

		for (const [i, operationsChunk] of Object.entries(operationsChunks)) {
			// Se esta chunk não for a primeira, espera um tempo antes de realizar as operações
			if (i !== '0') {
				log('cyan', 'Planilhas Google', true)(`Aguardando ${SLEEP_BETWEEN_CHUNKS} segundos antes de continuar...`)
				await sleep(SLEEP_BETWEEN_CHUNKS * 1000)
			}

			// Realiza as operações de cada tipo separadas, exemplo: primeiro as deleteOperations, depois as createOperations
			for (const operationsByType of operationsChunk) {
				const operationsPromises = operationsByType.map((op) => op().catch(() => errors++))
				await Promise.all(operationsPromises)
			}
		}

		log('greenBright', 'Planilhas Google', true)(`Requisição finalizada (${errors} erro(s) - ${Date.now() - startTime}ms)`)

		// Responde com uma mensagem de sucesso
		res.json({
			success: true,
			addedIntents: intents.length,
			removedIntents: currentIntents.length,
			errors: errors,
			time: Date.now() - startTime
		})
	} catch (err) {
		// Caso ocorra algum erro
		res.json({ success: false, error: err })
		log('redBright', 'Erro')('Erro ao inserir dados das Planilhas Google', err)
	}
})

app.use('/googleSheets', router)

const PORT = process.env.PORT || 443
log('greenBright', 'Planilhas Google')(`Servidor aberto na porta ${PORT} na rota /googleSheets`)

module.exports = router