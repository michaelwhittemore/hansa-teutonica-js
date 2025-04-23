import { TEST_PLAYERS } from "./helpers/constants.js"
import { createDivWithClassAndIdAndStyle } from "./helpers/helpers.js";

const populatePlayerSelectionWithDefault = () => {
    for (let i = 0; i < TEST_PLAYERS.length; i++) {
        // I'm not zero indexing for UI
        document.getElementById(`playerName-${i + 1}`).value = TEST_PLAYERS[i][0]
        document.getElementById(`playerColor-${i + 1}`).value = TEST_PLAYERS[i][1]
        document.getElementById(`playerColor-${i + 1}`).style.color = TEST_PLAYERS[i][1]
    }
    document.getElementById('playerNumber').value = TEST_PLAYERS.length;
};

const populatePlayerSelection = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    for (let i = 0; i < playerNumber; i++) {
        playerSelector.append(createPlayerInfoDiv(i + 1))
    }
};

const modifyPlayerSelection = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    const currentSize = playerSelector.childElementCount;
    if (currentSize < playerNumber) {
        for (let i = currentSize; i < playerNumber; i++) {
            playerSelector.append(createPlayerInfoDiv(i + 1))
        }
    } else if (currentSize > playerNumber) {
        for (let i = currentSize; i > playerNumber; i--) {
            document.getElementById(`playerInfo-${i}`).remove();
        }
    }
}

const createPlayerInfoDiv = (id) => {
    const playerInfoDiv = createDivWithClassAndIdAndStyle(['playerInfo'], `playerInfo-${id}`)
    const playerNameLabel = document.createElement('label')
    playerNameLabel.innerText = `Player ${id} Name: `;
    playerNameLabel.htmlFor = `playerName-${id}`
    const playerNameInput = document.createElement('input')
    playerNameInput.id = `playerName-${id}`

    const playerColorLabel = document.createElement('label')
    playerColorLabel.innerText = ` Player ${id} Color: `;
    playerColorLabel.htmlFor = `playerColor-${id}`
    const playerColorInput = document.createElement('input')
    playerColorInput.id = `playerColor-${id}`

    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorLabel, playerColorInput)
    return playerInfoDiv
}

const startGame = () => {
    // TODO
    // Need to find game mode (i.e. online vs hotseat), but right now I'm, going to default to hotseat
    // Will need some validation here, but let's not worry about it for the moment
    // We can't allow special characters because they would screw up my URL I think
    // I don't need the player array, can directly add to URL
    // May need to encodeURI for special characters
    const playerSelector = document.getElementById('playerSelector')

    const url = new URL(document.location.href);
    url.pathname = 'hotseat'
    url.searchParams.append('playerNumber', playerSelector.childElementCount)
    for (let i = 0; i < playerSelector.childElementCount; i++) {
        const name = document.getElementById(`playerName-${i + 1}`).value;
        const color = document.getElementById(`playerColor-${i + 1}`).value;

        url.searchParams.append(`playerName-${i}`, name)
        url.searchParams.append(`playerColor-${i}`, color)
    }

    if (!URL.canParse(url)) {
        console.error('Can not parse url', url)
        return;
    }
    window.location.assign(url)

}

const playerNumberOnChange = () => {
    const playerNumber = document.getElementById('playerNumber').value;
    console.log(playerNumber)
    modifyPlayerSelection(playerNumber)
}

const bindButtons = () => {
    document.getElementById('playerNumber').onchange = playerNumberOnChange
    document.getElementById('start').onclick = startGame
}

// TODO's 
/* 
* Eventually we would like the config to pop up when you select "hotseat" - possibly just hide it otherwise
* Need to validate colors work
* Need to sanitize player input - both kinds
* Use a nicer color selector
* Shouldn't worry too much about the player's colors not being updated right now
* Start should also be hidden until the game mode is selected
* Stylize the selectors a little 
**/

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
}
window.onload = start;