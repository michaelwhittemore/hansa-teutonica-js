import { TEST_PLAYERS } from "./helpers/constants.js"
import { createDivWithClassAndIdAndStyle } from "./helpers/helpers.js";

const populatePlayerSelectionWithDefault = () => {
    // Populate with default using TEST_PLAYERS
    for (let i = 0; i < TEST_PLAYERS.length; i++) {
        console.log(TEST_PLAYERS[i])
        // I'm not zero indexing for UI
        document.getElementById(`playerName-${i+1}`).value = TEST_PLAYERS[i][0]
        document.getElementById(`playerColor-${i+1}`).value = TEST_PLAYERS[i][1]
        document.getElementById(`playerColor-${i+1}`).style.color = TEST_PLAYERS[i][1]
    }
};

const populatePlayerSelection = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    // need a helper to add the element
    // need to check the current number of elements - not sure if can just get direct children

    for (let i = 1; i <= playerNumber; i++) {
        playerSelector.append(createPlayerInfoDiv(i))
    }

};

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

const bindButtons = () => {
    const playerNumberDropdown = document.getElementById('playerNumber')
}

// TODO's eventually we would like the config to pop up when you select "hotseat" - possibly just hide it otherwise

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
}
window.onload = start;