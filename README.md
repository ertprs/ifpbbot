<div align="center">
	<img height="100" src="logo.png" alt="Logo">
	<h1>IFPB Picuí ChatBot</h1>
</div>

Faz a integração do Dialogflow com o WhatsApp e Telegram

<br>

# 🌐 Site
Você pode acessar o chatbot diretamente pelo site:

[Clique aqui para acessar](http://ifpbpicuibot.herokuapp.com/)

<br>

# ⬇ Download
```
git clone https://github.com/josejefferson/ifpbbot.git
cd ifpbbot
```

<br>

# 🔧 Instalação
> Se você possui o navegador **Chrome** instalado em seu computador, você pode definir a variável de ambiente `PUPPETEER_SKIP_DOWNLOAD` como qualquer valor para não fazer o download do Chromium automaticamente

```
npm install
```

<br>

# 🔧 Configuração

## ❌ Desabilitar uma plataforma
Caso você queira desativar alguma plataforma, como o WhatsApp ou Telegram, você deve definir a variável de ambiente `DISABLE_WHATSAPP`, `DISABLE_TELEGRAM`, `DISABLE_GOOGLE_SHEETS`, `DISABLE_WEBHOOK`, `DISABLE_SCHEDULER` ou `DISABLE_SITE` como `1`

<br>

## 1. Configuração do Dialogflow
* Defina a variável de ambiente `PROJECT_ID` com o ID do seu projeto no Dialogflow
* Defina a variável de ambiente `GCLOUD_CREDENTIALS` com as credenciais em formato de JSON do seu projeto ([tutorial aqui](https://botflo.com/understanding-dialogflow-service-account-roles-and-their-use-cases/))

<br>

## 2. Configuração do WhatsApp
* Execute o servidor e ao aparecer o QR Code escaneie utilizando a função **Aparelhos conectados** do seu app
* Logo após, um arquivo `whatsapp_auth.json` será gerado na raiz.

> Se você NÃO estiver usando o WhatsApp **Business**, defina a variável de ambiente `WHATSAPP_LISTS=1` para ativar as listas do WhatsApp, pois o WhatsApp Business não suporta

### Configurar números permitidos (opcional)
Caso você queira, você pode restringir o acesso do robô a determinados contatos. Para isso, coloque-os na variável de ambiente `WHATSAPP_ALLOWED_NUMBERS` os números separados por vírgula, exemplo: `55ddxxxxxxxx@c.us,55ddxxxxxxxx@c.us` (onde **d** é o DDD do número e o **x** são os dígitos do número sem o 9)

<br>

## 3. Configuração do Telegram
* Crie seu bot no @BotFather e coloque o token na variável de ambiente `TELEGRAM_BOT_TOKEN`

### Configurar Webhook
* Coloque o URL do seu servidor Webhook na variável `TELEGRAM_WEBHOOK_URL`

<br>

## 4. Configuração do Planilhas Google
> Se você não quiser usar o Planilhas Google, use a variável `DISABLE_GOOGLE_SHEETS` e pule esta etapa
* _Instruções disponíveis em breve_

<br>

## 5. Configuração do Webhook
> Se você não quiser usar o webhook, use a variável `DISABLE_WEBHOOK` e pule esta etapa

* Defina a variável `MONGO_DB` com o link do seu banco de dados MongoDB

<br>

# 🚀 Executar
Para **iniciar o servidor**, basta executar o comando:
```
npm start
```

Caso precise **ver as respostas do Dialogflow**, execute no modo **dev**:
```
npm run dev
```

Se quiser executar **apenas o servidor do WhatsApp**, execute:
```
npm run whatsapp
```

Ou se quiser **apenas o servidor do Telegram**:
```
npm run telegram
```

Ou **apenas a integração com Planilhas Google**:
```
npm run googleSheets
```

Para executar **apenas o servidor webhook**:
```
npm run webhook
```

Ou para **apenas o site**:
```
npm run site
```

<br>

<div align="center"><sub>Desenvolvido por Jefferson Dantas</sub></div>