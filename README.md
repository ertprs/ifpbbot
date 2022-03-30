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
Caso você queira desativar alguma plataforma, como o WhatsApp ou Telegram, você deve definir a variável de ambiente `DISABLE_WHATSAPP`, `DISABLE_TELEGRAM`, `DISABLE_WEBHOOK` ou `DISABLE_SITE` como `1`

<br>

## 1. Configuração do Dialogflow
* Defina a variável de ambiente `PROJECT_ID` com o ID do seu projeto no Dialogflow
* Defina a variável de ambiente `GCLOUD_CREDENTIALS` com as credenciais em formato de JSON do seu projeto ([tutorial aqui](https://botflo.com/understanding-dialogflow-service-account-roles-and-their-use-cases/))

<br>

## 2. Configuração do WhatsApp
> Se você optou por utilizar apenas o Telegram, use a variável `DISABLE_WHATSAPP` e pule esta etapa

* Execute o servidor e ao aparecer o QR Code escaneie utilizando a função WhatsApp Web do seu app
* Logo após, um arquivo `wa-session` será gerado na pasta `whatsapp/`. *Se necessário*, você pode incluir o conteúdo dele na variável de ambiente `WHATSAPP_TOKEN`

### Configurar números permitidos (opcional)
Caso você queira, você pode restringir o acesso do robô a determinados contatos. Para isso, coloque-os na variável de ambiente `WHATSAPP_ALLOWED_NUMBERS` os números separados por vírgula, exemplo: `55ddxxxxxxxx@c.us,55ddxxxxxxxx@c.us` (onde **d** é o DDD do número e o **x** são os dígitos do número sem o 9)

<br>

## 3. Configuração do Telegram
> Se você optou por utilizar apenas o WhatsApp, use a variável `DISABLE_TELEGRAM` e pule esta etapa

* Crie seu bot no @BotFather e coloque o token na variável de ambiente `TELEGRAM_BOT_TOKEN`

### Configurar Webhook
* Coloque o URL do seu servidor Webhook na variável `TELEGRAM_WEBHOOK_URL` (sem a barra "/" no final)
* Coloque o caminho do servidor na variável `TELEGRAM_WEBHOOK_SECRET_PATH` começando com barra "/"

<br>

## 4. Configuração do Webhook
> Se você não quiser usar o webhook, use a variável `DISABLE_WEBHOOK` e pule esta etapa

* Defina as variáveis `DB_HOST`, `DB_NAME`, `DB_USERNAME` e `DB_PASSWORD` com as credenciais do seu banco de dados MySQL

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

Para executar **apenas o servidor webhook**:
```
npm run webhook
```