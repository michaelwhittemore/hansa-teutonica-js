import { TEST_PLAYERS } from "./helpers/constants.js"
import { createDivWithClassAndIdAndStyle } from "./helpers/helpers.js";

const populatePlayerSelectionWithDefault = () => {
    for (let i = 0; i < TEST_PLAYERS.length; i++) {
        // I'm not zero indexing for UI
        document.getElementById(`playerName-${i+1}`).value = TEST_PLAYERS[i][0]
        document.getElementById(`playerColor-${i+1}`).value = TEST_PLAYERS[i][1]
        document.getElementById(`playerColor-${i+1}`).style.color = TEST_PLAYERS[i][1]
    }
};

const populatePlayerSelection = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    // need to check the current number of elements - not sure if can just get direct children

    for (let i = 0; i < playerNumber; i++) {
        playerSelector.append(createPlayerInfoDiv(i + 1))
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

const startGame = () => {
    // TODO
    // Need to find gamemode, but right now I'm, going to default to hotseat
    // Will need some validation here, but let's not worry about it for the moment
    // We can't allow special characters because they would screw up my URL I think
    // I don't need the player array, can directly add to URL
    // May need to encodeURI for special charcters
    const url = new URL(document.location.href);
    url.pathname = 'hotseat'

    const playerSelector = document.getElementById('playerSelector')
    for (let i = 0; i < playerSelector.childElementCount; i++ ){
        const id = i + 1;
        const name = document.getElementById(`playerName-${id}`).value;
        const color = document.getElementById(`playerColor-${id}`).value;

        url.searchParams.append(`playerName-${id}`, name)
        url.searchParams.append(`playerColor-${id}`, color)
    }

    console.log(url)
    if (!URL.canParse(url)){
        console.error('Can not parse url', url)
    }
    window.location.assign(url)

}

const bindButtons = () => {
    const playerNumberDropdown = document.getElementById('playerNumber')
    document.getElementById('start').onclick = startGame
}

// TODO's 
/* 
* Eventually we would like the config to pop up when you select "hotseat" - possibly just hide it otherwise
* Need to validate colors work
* Need to sanitize player input - both kinds
* Use a nicer color selector
* Add an onchange to the player number drop down
* Add the start button with the url parser
* Start should also be hidden until the game mode is selected
**/ 

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
}
window.onload = start;