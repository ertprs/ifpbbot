require('dotenv/config')
require('module-alias/register')
const exportAgent = require('./export-agent')
const uploadBackup = require('./upload-backup')
const { schedule } = require('@helpers')
const log = require('@logger')

// Faz o backup
async function makeBackup() {
	const BACKUP_FILE_NAME = `backup-${new Date().toISOString()}.zip`
	const BACKUP_MIME_TYPE = 'application/zip'
	const BACKUP_PARENT_FOLDER = process.env.DRIVE_BACKUP_PARENT ? [process.env.DRIVE_BACKUP_PARENT] : []

	// Retorna um arquivo ZIP do agente do Dialogflow
	const agentBuffer = await exportAgent()

	// Envia o arquivo para o Google Drive
	return await uploadBackup(
		BACKUP_FILE_NAME,
		BACKUP_MIME_TYPE,
		agentBuffer,
		BACKUP_PARENT_FOLDER
	)
}

// Agenda o próximo backup
function scheduleNext() {
	const date = new Date()
	date.setHours(date.getHours() < 9 ? 9 : 9 + 24, 0, 0, 0)

	schedule(date, () => {
		scheduleNext()
		makeBackup().catch((err) => {
			log('redBright', 'Backup')('Erro ao fazer backup:', err)
		})
	}, true)
}

scheduleNext()

module.exports = makeBackup