# Função `getDFResponse`

### `getDFResponse(text, from, platform = '')`

Recebe como parâmetros a **mensagem do usuário** (`text`), o **remetente** (`from`) que pode ser em qualquer formato e o **nome da plataforma** (`platform`).

Esta função retorna uma *Promise* que resolvida retorna um *array* com as respostas do Dialogflow. Cada tipo de resposta é especificado abaixo:

## Estrutura da resposta
```javascript
[
  {
    type: 'text|chips|option_list|template_buttons|image|video|audio|gif|file|sticker|contact|accordion|reaction|random'
    // Outros parâmetros específicos de cada tipo
  },
  ...
]
```

### Custom Payload
Estes objetos podem ser incluídos na resposta do Dialogflow como **Custom Payload** com a seguinte estrutura:
```json
{
  "richContent": [
    [
      // Incluir objetos aqui
    ]
  ]
}
```

### `text` (gerado automaticamente)
Envia uma mensagem simples de texto
```json
{
  "type": "text",
  "text": ["Texto da mensagem"]
}
```

### `chips`
Envia botões clicáveis para respostas rápidas<br>
[Documentação do Dialogflow Messenger](https://cloud.google.com/dialogflow/es/docs/integrations/dialogflow-messenger#suggestion_chip_response_type)
> Obs.: O WhatsApp suporta no máximo 3 botões

```json
{
  "type": "chips",
  "options": [
    { "text": "Botão 1" },
    { "text": "Botão 2" },
    { "text": "Botão 3" }
  ]
}
```

### `option_list`
Envia uma lista de opções<br>
> Obs.: Somente suportado pelo WhatsApp (não suportado pelo WhatsApp Business) e Telegram

> Importante.: Se você estiver no WhatsApp normal, adicione a variável de ambiente `WHATSAPP_LISTS=1` para funcionar, caso esteja no WhatsApp Business, não adicione pois não irá funcionar

> No Telegram será enviado como texto comum

```json
{
  "type": "option_list",
  "buttonText": "Texto do botão",
  "title": "Título", // Opcional
  "body": "Conteúdo",
  "footer": "Rodapé", // Opcional, nem sempre funciona
  "sections": [
    {
      "title": "Título 1",
      "rows": [
        { "title": "Opção 1" },
        { "title": "Opção 2" },
        { "title": "Opção 3" }
      ]
    },
    {
      "title": "Título 2",
      "rows": [
        { "title": "Opção 1", "description": "Descrição 1" },
        { "title": "Opção 2", "description": "Descrição 2" }
      ]
    }
  ]
}
```

### `template_buttons`
Envia um cartão com botões<br>
> Obs.: Somente suportado pelo WhatsApp

```json
{
  "type": "template_buttons",
  "text": "Texto",
  "footer": "Rodapé", // Opcional
  "templateButtons": [{
      "urlButton": {
        "displayText": "Texto do link",
        "url": "https://github.com/josejefferson/ifpbbot"
      }
    },
    {
      "callButton": {
        "displayText": "Texto do telefone",
        "phoneNumber": "+55 (11) 98765-4321"
      }
    },
    {
      "quickReplyButton": {
        "displayText": "Botão comum"
      }
    }
  ]
}
```

### `image`
Envia uma imagem<br>
[Documentação do Dialogflow Messenger](https://cloud.google.com/dialogflow/es/docs/integrations/dialogflow-messenger#image_response_type)
```json
{
  "type": "image",
  "rawUrl": "URL da imagem",
  "accessibilityText": "Legenda da imagem" // Opcional
}
```

### `video`
Envia um vídeo
> Não suportado pelo Dialogflow Messenger
```json
{
  "type": "video",
  "url": "URL do vídeo",
  "caption": "Legenda do vídeo" // Opcional
}
```

### `audio`
Envia um áudio
> Não suportado pelo Dialogflow Messenger

> No WhatsApp, envie em formato .opus
```json
{
  "type": "audio",
  "url": "URL do áudio",
  "caption": "Legenda do áudio" // Opcional
}
```

### `gif`
Envia um GIF
> Não suportado pelo Dialogflow Messenger

> No WhatsApp, envie em formato de vídeo (.mp4), não em formato .gif
```json
{
  "type": "gif",
  "url": "URL do GIF",
  "caption": "Legenda do GIF" // Opcional
}
```

### `file`
Envia um arquivo
> Não suportado pelo Dialogflow Messenger
```json
{
  "type": "file",
  "url": "URL do arquivo",
  "name": "Nome do arquivo" // Opcional
}
```

### `sticker`
Envia uma figurinha
> Não suportado pelo Dialogflow Messenger

> O Telegram suporta figurinhas apenas no formato WebP, outros formatos serão enviados como arquivos

> O WhatsApp suporta outros formatos

> Para enviar uma figurinha animada no WhatsApp envie um WebP animado, não um GIF

> O Telegram não suporta figurinhas animadas
```json
{
  "type": "sticker",
  "url": "URL da imagem"
}
```

### `contact`
Envia um contato (número de telefone)<br>
Formato recomendado: "551187654321@c.us"
> Não suportado pelo Dialogflow Messenger
```json
{
  "type": "contact",
  "name": "Nome do contato",
  "phone": "Número de telefone",
  "email": "E-mail do contato"
}
```

### `accordion`
Envia um acordeão, que pode ser expandido ao clicar<br>
[Documentação do Dialogflow Messenger](https://cloud.google.com/dialogflow/es/docs/integrations/dialogflow-messenger#accordion_response_type)
```json
{
  "type": "accordion",
  "title": "Título do acordeão",
  "text": "Conteúdo"
}
```

### `reaction`
Reage à mensagem anterior<br>
> Obs.: Somente suportado pelo WhatsApp

```json
{
  "type": "reaction",
  "emoji": "❤"
}
```

### `random`
Envia um _payload_ aleatório ou um conjunto de _payloads_ de qualquer tipo<br>
> Não suportado pelo Dialogflow Messenger
```json
{
  "type": "random",
  "items": [
    { "type": "text", "text": "Texto único" },

    // Ou

    { "type": "chips", "options": [{ "text": "Botão" }] },

    // Ou

    [
      { "type": "text", "text": "Texto 1" },
      { "type": "text", "text": "Texto 2" }
    ]
  ]
}
```

<br>

> A documentação para outros tipos que **funcionam apenas no Dialogflow Messenger** podem ser encontrados em: https://cloud.google.com/dialogflow/es/docs/integrations/dialogflow-messenger#info_response_type

<br>

## Ignorar plataforma
Em qualquer um destes objetos é possível adicionar um parâmetro para ignorar certas plataformas, como por exemplo:
```json
{
  "type": "accordion",
  "title": "Título do acordeão",
  "text": "Conteúdo",
  "ignoreWhatsApp": true, // Esta mensagem não será enviada no WhatsApp
  "ignoreTelegram": true // Esta mensagem não será enviada no Telegram
}
```