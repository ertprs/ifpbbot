const env = PropertiesService.getScriptProperties()
const ui = SpreadsheetApp.getUi()
const active = SpreadsheetApp.getActive()

// Variáveis de ambiente
let SERVER_URL = env.getProperty('SERVER_URL')
let SERVER_PATH = env.getProperty('SERVER_PATH') || '/googleSheets/dialogflow/syncIntents'
let SHEET_ID = env.getProperty('SHEET_ID')
let USERNAME = env.getProperty('USERNAME')
let PASSWORD = env.getProperty('PASSWORD')
let auth = Utilities.base64Encode(USERNAME + ':' + PASSWORD)

/**
 * Envia os dados para o Dialogflow
 */
function updateDialogflow() {
  // Verifica se não falta variáveis
  missingInfo()

  // Calcula o tempo da requisição
  const startTime = Date.now()
  active.toast('Inserindo as intenções no Dialogflow, aguarde...', '⏳ Atualizando', 30)

  try {
    const sheet = SpreadsheetApp.getActiveSheet() // Planilha ativa
    const data = sheet.getDataRange().getValues() // Todos os valores

    // Faz a requisição para o servidor
    var response = UrlFetchApp.fetch(SERVER_URL + SERVER_PATH, {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Basic ' + auth },
      payload: JSON.stringify({ data, sheetID: SHEET_ID })
    })
  } catch (err) {
    // Erro
    active.toast(err.message, '❌ Falha', 15)
    console.error(err)
    return
  }

  const responseText = response.getContentText() // Resposta do servidor em texto
  const totalTime = Date.now() - startTime // Tempo da requisição
  const responseJson = JSON.parse(responseText) // Resposta em JSON
  const success = !!responseJson.success // Comando executado com êxito
  const time = responseJson.time || '???' // Tempo de processamento do Dialogflow
  console.log(responseJson)

  if (success) {
    active.toast(`As intenções foram adicionadas corretamente no Dialogflow (tempo: ${time}ms/${totalTime}ms)`, '✅ Sucesso', 5)
  } else {
    active.toast('Ocorreu um erro ao adicionar as intenções no Dialogflow', '❌ Falha', 5)
  }
}

/**
 * Funções executadas ao abrir a planilha
 */
function onOpen() {
  // Menu
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('CHATBOT')
    .addItem('Enviar dados para o Dialogflow', 'updateDialogflow')
    .addItem(`Mudar nome da planilha`, 'changeSheetName')
    .addSeparator()
    .addItem('Mudar URL do servidor', 'changeServerURL')
    .addItem('Mudar caminho do servidor', 'changeServerPath')
    .addItem('Mudar usuário do servidor', 'changeServerUsername')
    .addItem('Mudar senha do servidor', 'changeServerPassword')
    .addToUi()

  // Configuração da planilha
  missingInfo()
}

/**
 * Configura as variáveis da planilha
 */
function missingInfo() {
  if (!SERVER_URL) {
    const result = ui.alert('Planilha não configurada', 'Esta planilha não foi configurada ainda,\né necessário fazer a configuração dela', ui.ButtonSet.OK_CANCEL)
    if (result === ui.Button.OK) {
      changeServerURL()
      changeServerUsername()
      changeServerPassword()
    }
  }

  if (!SHEET_ID) {
    changeSheetName(false)
  }
}

/**
 * Muda o nome da planilha
 */
function changeSheetName(manual = true) {
  const result = ui.prompt('Nome da planilha', `Digite um nome para esta planilha, que será exibido como prefixo\ndo nome das intents no Dialogflow.\nUse um nome curto e simples${SHEET_ID ? ` (atual: ${SHEET_ID})` : ''}.\n\nIMPORTANTE.: Este nome não deve ser usado por outras planilhas!`, ui.ButtonSet.OK_CANCEL)
  const button = result.getSelectedButton()
  const text = result.getResponseText()

  if (manual) {
    if (button === ui.Button.OK && text) {
      SHEET_ID = text
    }
  } else {
    if (button === ui.Button.OK && text) {
      SHEET_ID = text
    } else {
      SHEET_ID = Math.floor(Math.random() * 9999).toString()
    }
  }

  env.setProperty('SHEET_ID', SHEET_ID)
}

/**
 * Muda a URL do servidor
 */
function changeServerURL() {
  const result = ui.prompt('URL do servidor', `Digite o URL do servidor sem a barra (/) no final${SERVER_URL ? ` (atual: ${SERVER_URL})` : ''}.`, ui.ButtonSet.OK_CANCEL)
  const button = result.getSelectedButton()
  const text = result.getResponseText()

  if (button === ui.Button.OK && text) {
    SERVER_URL = text
    env.setProperty('SERVER_URL', SERVER_URL)
  }
}

/**
 * Muda o caminho do servidor
 */
function changeServerPath() {
  const result = ui.prompt('Caminho do servidor', `Digite o caminho do servidor iniciando por barra (/)${SERVER_PATH ? ` (atual: ${SERVER_PATH})` : ''}.`, ui.ButtonSet.OK_CANCEL)
  const button = result.getSelectedButton()
  const text = result.getResponseText()

  if (button === ui.Button.OK && text) {
    SERVER_PATH = text
    env.setProperty('SERVER_PATH', SERVER_PATH)
  }
}

/**
 * Muda o nome de usuário de autenticação do servidor
 */
function changeServerUsername() {
  const result = ui.prompt('Usuário do servidor', `Digite o nome do usuário para se autenticar no servidor${USERNAME ? ` (atual: ${USERNAME})` : ''}.`, ui.ButtonSet.OK_CANCEL)
  const button = result.getSelectedButton()
  const text = result.getResponseText()

  if (button === ui.Button.OK && text) {
    USERNAME = text
    env.setProperty('USERNAME', USERNAME)
    auth = Utilities.base64Encode(USERNAME + ':' + PASSWORD)
  }
}

/**
 * Muda a senha de autenticação do servidor
 */
function changeServerPassword() {
  const result = ui.prompt('Senha do servidor', `Digite a senha para se autenticar no servidor.`, ui.ButtonSet.OK_CANCEL)
  const button = result.getSelectedButton()
  const text = result.getResponseText()

  if (button === ui.Button.OK && text) {
    PASSWORD = text
    env.setProperty('PASSWORD', PASSWORD)
    auth = Utilities.base64Encode(USERNAME + ':' + PASSWORD)
  }
}