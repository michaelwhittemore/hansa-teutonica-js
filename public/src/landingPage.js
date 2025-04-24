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
    playerNameInput.className = 'playerNameInput'
    playerNameInput.id = `playerName-${id}`

    // HERE!
    // Let's just create a button for each that exposes the color picker
    // WIll also need to update the player defaults to use pickable color

    const playerColorLabel = document.createElement('label')
    playerColorLabel.innerText = ` Player ${id} Color: `;
    playerColorLabel.htmlFor = `playerColor-${id}`
    const playerColorInput = document.createElement('input')
    playerColorInput.id = `playerColor-${id}`

    const playerErrorDisplay = createDivWithClassAndIdAndStyle(['playerError'], `playerError-${id}`);

    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorLabel, playerColorInput, playerErrorDisplay)
    return playerInfoDiv
}

const startGame = () => {
    const playerSelector = document.getElementById('playerSelector')
    let allValid = true;
    const url = new URL(document.location.href);
    url.pathname = 'hotseat'
    url.searchParams.append('playerNumber', playerSelector.childElementCount)
    for (let i = 0; i < playerSelector.childElementCount; i++) {
        const nameInput = document.getElementById(`playerName-${i + 1}`);

        const name = nameInput.value;
        const nameValidation = validateName(name);

        nameInput.classList.remove('invalidForm')
        document.getElementById(`playerError-${i + 1}`).innerText = ''
        if (!nameValidation[0]) {
            nameInput.classList.add('invalidForm')
            document.getElementById(`playerError-${i + 1}`).innerText = nameValidation[1]
            console.error(nameValidation[1])
            allValid = false
        }

        const color = document.getElementById(`playerColor-${i + 1}`).value;
        url.searchParams.append(`playerName-${i}`, name)
        url.searchParams.append(`playerColor-${i}`, color)
    }
    if (!allValid) {
        return
    }
    if (!URL.canParse(url)) {
        console.error('Can not parse url', url)
        return;
    }
    window.location.assign(url)

}

const playerNumberOnChange = () => {
    const playerNumber = document.getElementById('playerNumber').value;
    modifyPlayerSelection(playerNumber)
}

const bindButtons = () => {
    document.getElementById('playerNumber').onchange = playerNumberOnChange
    document.getElementById('start').onclick = startGame
}

const validateName = (nameString) => {
    if (nameString === '') {
        return [false, 'Names may not be empty.']
    }
    if (nameString.length > 20){
        return [false, 'Names may not be longer than 20 characters.']
    }
    // ^[a-zA-Z0-9\_]*$ 
    /*
    "^" : Start of string
    "[a-zA-Z0-9_]": Matches alphanumeric or underscore (don't need to escape underscore)
    "*": Zero or more instances of the preceding regex token
    "$": End of string
    */
    if (!/^[a-zA-Z0-9_]*$/.test(nameString)) {
        return [false, 'Names can only contain alphanumerics or underscores.']
    }
    return [true, 'This should never be displayed']
}
// I'm just testing this, I'll need to add it to a hidden popup later
const createColorPicker = (id) => {
    const colorPicker = createDivWithClassAndIdAndStyle(['colorPicker'], `colorPicker-${id}`, {
        // visibility: 'hidden'
    })
    // let's create a 5 by five grid
    colorOptions.forEach(color => {
        const colorSelector = createDivWithClassAndIdAndStyle(['colorSelection'], color, {
            'backgroundColor': color
        })
        colorPicker.onclick = () => {
            console.log(id, color)
        }
        colorPicker.append(colorSelector)
    })
    document.body.append(colorPicker)
}

const colorOptions = [
    '#696969',
    '#a52a2a',
    '#008000',
    '#4b0082',
    '#ff0000',
    '#00ced1',
    '#ffa500',
    '#7cfc00',
    '#00fa9a',
    '#0000ff',
    '#ff00ff',
    '#1e90ff',
    '#eee8aa', 
    '#ffff54',
    '#dda0dd',
    '#ff1493',


]

// TODO's 
/* 
* Eventually we would like the config to pop up when you select "hotseat" - possibly just hide it otherwise
Need to validate colors work
* Use a nicer color selector
* Two Players can't have the same color. 
* Maybe we create a list of valid colors. Let's aim for thirty
* maybe a grid?
* Shouldn't worry too much about the player's colors not being updated right now
* Start should also be hidden until the game mode is selected
* Stylize the selectors a little 
* For online - should either offer 'NEW' or 'JOIN'. Will need to offer players the ability to create
// a room name, and will also need to give the game a GUID (maybe can just do a smaller hash)
* online play will need a waiting room feature, but that is beyond the scope of the landing page
**/

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
    createColorPicker(1) // remove this
}
window.onload = start;