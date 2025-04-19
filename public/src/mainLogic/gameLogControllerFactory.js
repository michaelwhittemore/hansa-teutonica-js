import { AUTO_SCROLL } from "../helpers/constants.js";
import { logicBundle } from "../helpers/logicBundle.js";
export const gameLogControllerFactory = () => {
    const gameLogController = {
        initializeGameLog(history) {
            // optionally, we should load in history
            const collapseButton = document.createElement('button');
            collapseButton.innerText = 'Collapse Game Log';
            collapseButton.className = 'collapseButton';
            collapseButton.onclick = () => this.toggleGameLog(collapseButton)
            document.getElementById('gameLogContainer').append(collapseButton)
            this.isCollapsed = false;
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
            // I think we can just do a string replace, we have full control over the inputs in this method
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
            // TODO add to saved history
        }
    }
    logicBundle.gameLogController = gameLogController
    return gameLogController
    
}
