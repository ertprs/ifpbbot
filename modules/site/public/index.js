// Estilos customizados
const dfMessenger = document.querySelector('df-messenger')
dfMessenger.addEventListener('df-messenger-loaded', () => {
	const $dfMessenger = document.querySelector('df-messenger').shadowRoot
	const $dfMessengerWrapper = $dfMessenger.querySelector('.df-messenger-wrapper')
	const $dfMessengerChat = $dfMessengerWrapper.querySelector('df-messenger-chat').shadowRoot
	const $chatWrapper = $dfMessengerChat.querySelector('.chat-wrapper')
	const $dfMessengerTitlebar = $chatWrapper.querySelector('df-messenger-titlebar').shadowRoot
	const $titleWrapper = $dfMessengerTitlebar.querySelector('.title-wrapper')
	const $dfMessengerMessageList = $chatWrapper.querySelector('df-message-list').shadowRoot
	const $dfMessengerMessageListStyle = $dfMessengerMessageList.querySelector('style[scope="df-message-list"]')
	const $messageListWrapper = $dfMessengerMessageList.querySelector('.message-list-wrapper')
	const $dfMessengerUserInput = $chatWrapper.querySelector('df-messenger-user-input').shadowRoot
	const $dfMessengerInput = $dfMessengerUserInput.querySelector('input[type="text"]')

	$chatWrapper.style.maxWidth = '500px'
	$chatWrapper.style.width = '100%'
	$chatWrapper.style.height = 'calc(100% - 20px)'
	$chatWrapper.style.left = '50%'
	$chatWrapper.style.transform = 'translateX(-50%)'
	$chatWrapper.style.top = '10px'
	$chatWrapper.style.zIndex = '1'
	$dfMessengerInput.placeholder = 'Digite sua mensagem aqui...'
	$dfMessengerInput.focus()

	$titleWrapper.querySelector('#minimizeIcon').style.display = 'none'
	$dfMessengerWrapper.querySelector('#widgetIcon').style.display = 'none'

	$dfMessengerChat.querySelector('style').innerHTML += `
		@media (max-width: 500px) {
			.chat-wrapper {
				border-radius: 0 !important;
				height: 100% !important;
				top: 0 !important;
			}
		}`

	$dfMessengerTitlebar.querySelector('style').innerHTML += `
		@media (max-width: 500px) {
			.title-wrapper {
				border-radius: 0;
			}
		}
	`
})