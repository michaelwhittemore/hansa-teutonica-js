import { createDivWithClassAndIdAndStyle } from "./helpers.js"

export const createChatInput = (handleChatMessageSend) => {
    const chatInputDiv = createDivWithClassAndIdAndStyle(['chatInputDiv'], 'chatInputDiv');
    const textInputElement = document.createElement('input')
    textInputElement.id = 'textInputElement';
    textInputElement.maxLength = 40; // TODO - decide on the length
    const sendButton = document.createElement('button')
    sendButton.innerText = 'Send chat message';
    sendButton.onclick = () => {
        if (textInputElement.value === '') {
            console.error('Tried to send empty chat message.')
            return;
        }
        handleChatMessageSend(textInputElement.value)
        textInputElement.value = '';
    }
    chatInputDiv.append(textInputElement, sendButton)
    return chatInputDiv;
}

