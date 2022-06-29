const stream = require('stream')
const { google } = require('googleapis')

function uploadToGoogleDrive(name, mimeType, buffer, parents = []) {
	const body = new stream.PassThrough()
	body.end(buffer)

	const oauth2Client = new google.auth.OAuth2(
		process.env.GMAIL_CLIENT_ID,
		process.env.GMAIL_CLIENT_SECRET,
		process.env.GMAIL_REDIRECT_URI
	)

	oauth2Client.setCredentials({
		refresh_token: process.env.GMAIL_REFRESH_TOKEN // eslint-disable-line camelcase
	})

	const drive = google.drive({
		version: 'v3',
		auth: oauth2Client
	})

	return drive.files.create({
		requestBody: { name, mimeType, parents },
		media: { mimeType, body }
	})
}

module.exports = uploadToGoogleDrive