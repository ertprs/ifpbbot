const { DataTypes } = require('sequelize')
const sequelize = require('@helpers/database')

const Sessions = sequelize.define('Sessions', {
	data: {
		type: DataTypes.JSON,
		allowNull: false
	}
})

Sessions.sync()

module.exports = Sessions