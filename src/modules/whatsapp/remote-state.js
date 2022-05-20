const fs = require('fs')
const log = require('@helpers/logger')
require('@helpers/database')
const Data = require('@models/Data')

function useRemoteAuthState(filePath = './whatsapp_auth.json') {
	return {
		// Carrega o estado do banco de dados
		loadState() {
			// Se já houver um estado carregado localmente, não faz nada
			if (fs.existsSync(filePath)) {
				log('greenBright', 'WhatsApp', true)('Estado do WhatsApp encontrado no arquivo local')
				return Promise.resolve(false)
			}

			// Baixa o estado do banco de dados
			return Data.findOne({ type: 'whatsapp-state' }).then((state) => {
				if (state) {
					// Se houver um estado no banco de dados, salva no arquivo local
					log('greenBright', 'WhatsApp', true)('Estado do WhatsApp encontrado no banco de dados')
					fs.writeFileSync(filePath, JSON.stringify(state.data, null, 2))
					return true
				}
				// Se não houver um estado no banco de dados, não faz nada
				log('greenBright', 'WhatsApp', true)('Estado do WhatsApp NÃO encontrado no banco de dados NEM no arquivo local')
				return false
			}).catch((err) => {
				log('redBright', 'Whatsapp', true)('Falha ao carregar estado do WhatsApp do banco de dados', err)
				return false
			})
		},

		// Salva o estado no banco de dados
		saveState() {
			// Lê o estado do arquivo local
			const data = JSON.parse(fs.readFileSync(filePath, { encoding: 'UTF-8' }))

			// Envia o estado para o banco de dados
			return Data.findOne({ type: 'whatsapp-state' }).then((state) => {
				if (state) {
					// Se já houver um estado no banco de dados, atualiza
					state.data = data
					return state.save()
				} else {
					// Se não houver um estado no banco de dados, cria
					return Data.create({ type: 'whatsapp-state', data })
				}
			}).then(() => {
				log('greenBright', 'WhatsApp', true)('Estado salvo com sucesso')
			}).catch((err) => {
				log('redBright', 'Whatsapp', true)('Falha ao salvar estado do WhatsApp no banco de dados', err)
			})
		}
	}
}

module.exports = useRemoteAuthState