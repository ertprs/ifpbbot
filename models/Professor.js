const { DataTypes } = require('sequelize')
const sequelize = require('@helpers/database')

const Professor = sequelize.define('Professores', {
	nome: {
		type: DataTypes.STRING,
		allowNull: false
	},
	disciplina: {
		type: DataTypes.STRING,
		allowNull: false
	}
})

Professor.sync()

module.exports = Professor