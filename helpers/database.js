const Sequelize = require('sequelize')
const log = require('@helpers/logger')

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USERNAME,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'mysql',
		logging: false
	}
)

sequelize.authenticate()
	.then(() => log('greenBright', 'MySQL')('Conectado'))
	.catch((err) => log('redBright', 'MySQL')('Falha ao conectar\n' + err))

module.exports = sequelize