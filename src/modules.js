const { isDisabled } = require('@helpers')

/** Módulos */
const modulesArray = [
	// Caminho do módulo; Desabilitar; Mensagem de desabilitado
	['whatsapp', process.env.DISABLE_WHATSAPP, 'Robô do WhatsApp desativado'],
	['telegram', process.env.DISABLE_TELEGRAM, 'Robô do Telegram desativado'],
	['google-sheets', process.env.DISABLE_GOOGLE_SHEETS, 'Integração com Planilhas Google desativada'],
	['webhook', process.env.DISABLE_WEBHOOK, 'Servidor webhook desativado'],
	['scheduler', process.env.DISABLE_SCHEDULER, 'Agendador desativado'],
	['site', process.env.DISABLE_SITE, 'Site desativado'],
	['backup', process.env.DISABLE_BACKUP, 'Backup desativado']
]

// Converte os módulos do Array para objetos
const modules = modulesArray.map((modArr) => {
	return {
		path: modArr[0],
		disabled: isDisabled(modArr[1]),
		disabledMessage: modArr[2],
		started: false,
		error: null
	}
})

module.exports = modules