import { AUTO_SCROLL } from "../helpers/constants.js";
import { logicBundle } from "../helpers/logicBundle.js";
import { createChatInput } from "../helpers/createChatInput.js";
export const logControllerFactory = () => {
    const logController = {
        initializeGameLog() {
            // I think history will pretty much always be stored locally
            // optionally, we should load in history
            const collapseButton = document.createElement('button');
            collapseButton.innerText = 'Collapse Game Log';
            collapseButton.className = 'collapseButton';
            collapseButton.onclick = () => this.toggleGameLog(collapseButton)
            document.getElementById('gameLogContainer').append(collapseButton)
            this.isCollapsed = false;
        },
        setUpChatInput(handleChatMessageSend){
            // dev
            // remember that handleChatMessageSend is dependant on the web socket and the IS_ONLINE
            const chatInput = createChatInput(handleChatMessageSend)
            document.getElementById('gameLog').append(chatInput)
        },
        toggleGameLog(collapseButton) {
            if (!this.isCollapsed) {
                document.getElementById('gameLog').classList.add('collapsedContainer')
                collapseButton.innerText = 'Expand Game Log'
            } else {
                document.getElementById('gameLog').classList.remove('collapsedContainer')
                collapseButton.innerText = 'Collapse Game Log'
            }
            this.isCollapsed = !this.isCollapsed
        },
        addTextToGameLog(text, player1, player2) {
            // player is an optional parameter
            // what we want to do is replace every instance of the player name with a span 
            // that wraps around them and contains their color
            const timestamp = (new Date()).toLocaleTimeString('en-US')
            if (player1) {
                const player1NameSpan = `<span style="color: ${player1.color}">${player1.name}</span>`
                text = text.replaceAll('$PLAYER1_NAME', player1NameSpan)
            }
            if (player2) {
                const player2NameSpan = `<span style="color: ${player2.color}">${player2.name}</span>`
                text = text.replaceAll('$PLAYER2_NAME', player2NameSpan)
            }
            document.getElementById('gameLog').innerHTML += `${timestamp}: ${text}<br>`
            if (AUTO_SCROLL) {
                document.getElementById('gameLog').scrollTop = document.getElementById('gameLog').scrollHeight
            }
            // TODO, should we consider involving the game controller? I don't know if the log should be accessing
            // the memory by itself
            if (logicBundle.sessionInfo.isHotseatMode){
                window.localStorage.history = document.getElementById('gameLog').innerHTML;
            }
            
        },
        loadHistoryIntoLogFromLocalStorage(){
            document.getElementById('gameLog').innerHTML = window.localStorage.history;
            if (AUTO_SCROLL) {
                document.getElementById('gameLog').scrollTop = document.getElementById('gameLog').scrollHeight
            }
        },
    }
    logicBundle.logController = logController
    return logController
    
}
