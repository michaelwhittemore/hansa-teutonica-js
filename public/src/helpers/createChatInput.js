import { createDivWithClassAndIdAndStyle } from "./helpers.js"

// I think I'd like this go generate an element. It will follow the standard model where
// the factory function creates the chat controller. The chat controller in turn will have a method
// to initiate. It will need to return an element. p

// Perhaps this should only be a chat box (i.e. the input). The messages will be rendered by the game
// log history component. This function doesn't care about receiving messages, only sending. 

//  Let's get started by just creating a simple chat window. It should work for either hotseat or
// online, or the waiting room. Remember that ultimately it's just calling a game controller method. 
// Oh but if it's the waiting room how will that work with the logic bundle? Perhaps this should just be
// a helper method. Maybe when initialized it takes in a method to call? I feel like maybe we move this 
// to the helper file. If so it doesn't need to follow the factory model, right?

// PLAN
/*
1. Move this to the helper file
2. Rename to 'createChatInput' (it's not really a big controller)
3. Add to the initializeCitiesAndState. Make sure it's the save agnostic one. Just address hotseat for the moment
4. Add a gamecontroller method that adds to the game log. Or maybe logControllerFactory.js
5. CSS, make sure the field is at the bottom of the div
6. Don't forget to add helpers.css to the waiting room
4+ Then we can deal with creating handleChatMessageSend that involve messaging
*/


export const createChatInput = (handleChatMessageSend) => {
    const chatInputDiv = createDivWithClassAndIdAndStyle(['chatInputDiv'], 'chatInputDiv');
    const textInputElement = document.createElement('input')
    textInputElement.id = 'textInputElement';
    textInputElement.maxLength = 40; // TODO dev - decide on the length
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

