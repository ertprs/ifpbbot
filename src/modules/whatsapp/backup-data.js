const log = require('@helpers/logger')
const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')

const BACKUP_FILE_NAME = 'wwebjs-auth-backup.zip'
const DOWNLOAD_FILE_NAME = 'wwebjs-auth-backup-download.zip'
const BACKUP_FILE_PATH = path.join(__dirname, BACKUP_FILE_NAME)
const DOWNLOAD_FILE_PATH = path.join(__dirname, DOWNLOAD_FILE_NAME)
const WWEBJS_FOLDER_PATH = path.join(__dirname, '.wwebjs_auth')

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	process.env.GOOGLE_REDIRECT_URI
)

oauth2Client.setCredentials({
	refresh_token: process.env.GOOGLE_REFRESH_TOKEN // eslint-disable-line camelcase
})

const drive = google.drive({
	version: 'v3',
	auth: oauth2Client
})

function zipFolder(folderName, outputZipFile) {
	return new Promise((resolve, reject) => {
		const archiver = require('archiver')
		const output = fs.createWriteStream(outputZipFile)
		const archive = archiver('zip')

		archive.on('warning', (err) => {
			if (err.code === 'ENOENT') {
				log('yellowBright', 'WhatsApp - Aviso', err)
			} else {
				reject(err)
			}
		})
		archive.on('error', reject)
		output.on('close', resolve)
		output.on('end', resolve)
		archive.directory(folderName, folderName)
		archive.pipe(output)
		archive.finalize()
	})
}

function uploadFile(fileName, filePath, parentFolder) {
	return drive.files.create({
		requestBody: {
			name: fileName,
			mimeType: 'application/zip',
			parents: [parentFolder]
		},
		media: {
			mimeType: 'application/zip',
			body: fs.createReadStream(filePath)
		}
	})
}

async function downloadFile(fileName, downloadFilePath, parentFolder) {
	return new Promise(async (resolve, reject) => {
		const listFilesResponse = await drive.files.list({
			q: parentFolder ? `"${parentFolder}" in parents` : undefined
		})

		const file = listFilesResponse.data.files.find((file) => file.name === fileName)
		if (!file) return reject(new Error(`Arquivo ${fileName} não encontrado no Google Drive`))

		const dest = fs.createWriteStream(downloadFilePath)
		const downloadFileResponse = await drive.files.get({
			fileId: file.id,
			alt: 'media'
		}, {
			responseType: 'stream'
		})

		downloadFileResponse.data
			.on('end', resolve)
			.on('error', reject)
			.pipe(dest)
	})
}

function unzipFolder(downloadFileName, extractFilePath = __dirname) {
	const extract = require('extract-zip')
	return extract(downloadFileName, { dir: extractFilePath })
}


async function load() {
	try {
		log('yellowBright', 'WhatsApp - WWebJS')('Fazendo o download do arquivo de backup')
		await downloadFile(BACKUP_FILE_NAME, DOWNLOAD_FILE_PATH, process.env.GOOGLE_DRIVE_BACKUP_FOLDER)
		fs.rmSync(WWEBJS_FOLDER_PATH, { recursive: true, force: true })
		log('yellowBright', 'WhatsApp - WWebJS')('Descompactando o arquivo de backup')
		await unzipFolder(DOWNLOAD_FILE_PATH)
		log('greenBright', 'WhatsApp - WWebJS')('Arquivo de backup carregado com sucesso')
	} catch (err) {
		log('redBright', 'WhatsApp - WWebJS')('Ocorreu um erro ao carregar o arquivo de backup', err)
	} finally {
		if (fs.existsSync(DOWNLOAD_FILE_PATH)) fs.unlinkSync(DOWNLOAD_FILE_PATH)
	}
}

async function save(client) {
	try {
		log('yellowBright', 'WhatsApp - WWebJS', true)('Fechando servidor para backup')
		await client.destroy()
		log('yellowBright', 'WhatsApp - WWebJS', true)('Compactando o arquivo de backup')
		await zipFolder(WWEBJS_FOLDER_PATH, BACKUP_FILE_PATH)
		client.initialize()
		log('yellowBright', 'WhatsApp - WWebJS', true)('Fazendo o upload do arquivo de backup')
		await uploadFile(BACKUP_FILE_NAME, BACKUP_FILE_PATH, process.env.GOOGLE_DRIVE_BACKUP_FOLDER)
		log('greenBright', 'WhatsApp - WWebJS', true)('Arquivo de backup enviado com sucesso')
	} catch (err) {
		log('redBright', 'WhatsApp - WWebJS')('Ocorreu um erro ao enviar o arquivo de backup', err)
	} finally {
		if (fs.existsSync(BACKUP_FILE_PATH)) fs.unlinkSync(BACKUP_FILE_PATH)
	}
}

module.exports = { load, save }