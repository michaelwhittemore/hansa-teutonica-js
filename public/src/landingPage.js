import { TEST_PLAYERS } from "./helpers/constants.js"
import { createDivWithClassAndIdAndStyle } from "./helpers/helpers.js";

let pickingColorId;
let playerColorArray = []

const populatePlayerSelectionWithDefault = () => {
    for (let i = 0; i < TEST_PLAYERS.length; i++) {
        // I'm not zero indexing for UI
        document.getElementById(`playerName-${i}`).value = TEST_PLAYERS[i][0]
        document.getElementById(`playerColor-${i}`).innerHTML = 'Change Color'
        document.getElementById(`playerColor-${i}`).style.backgroundColor = TEST_PLAYERS[i][1]
    }
    document.getElementById('playerNumberHotseat').value = TEST_PLAYERS.length;
};

const populatePlayerSelection = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    for (let i = 0; i < playerNumber; i++) {
        playerSelector.append(createPlayerInfoDiv(i))
    }
};

const modifyNumberOfPlayers = (playerNumber) => {
    const playerSelector = document.getElementById('playerSelector')
    const currentSize = playerSelector.childElementCount;

    if (currentSize < playerNumber) {
        for (let i = currentSize; i < playerNumber; i++) {
            playerSelector.append(createPlayerInfoDiv(i))
        }
    } else if (currentSize > playerNumber) {
        playerColorArray.splice(playerNumber)
        for (let i = currentSize - 1; i > playerNumber - 1; i--) {
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

    const playerColorButton = document.createElement('button')
    playerColorButton.id = `playerColor-${id}`
    playerColorButton.innerText = 'Select Color';
    playerColorButton.onclick = () => {
        pickingColorId = id;
        document.getElementById('colorPicker').style.visibility = 'visible'
    }

    const playerErrorDisplay = createDivWithClassAndIdAndStyle(['playerError'], `playerError-${id}`);
    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorButton,playerErrorDisplay)

    return playerInfoDiv
}

// TODO - let's rename this to some thing that communicates it's hotseat specific
const startHotseatGame = () => {
    const playerSelector = document.getElementById('playerSelector')
    let allValid = true;
    const selectedColors = []
    const url = new URL(document.location.href);
    url.pathname = 'hotseat'
    url.searchParams.append('playerNumber', playerSelector.childElementCount)

    for (let i = 0; i < playerSelector.childElementCount; i++) {
        const nameInput = document.getElementById(`playerName-${i}`);

        const name = nameInput.value;
        const nameValidation = validateName(name);

        nameInput.classList.remove('invalidForm')
        document.getElementById(`playerError-${i}`).innerText = ''
        if (!nameValidation[0]) {
            nameInput.classList.add('invalidForm')
            document.getElementById(`playerError-${i}`).innerText = nameValidation[1]
            console.error(nameValidation[1])
            allValid = false;
        }

        const color = playerColorArray[i]
        if (!playerColorArray[i]){
            document.getElementById(`playerError-${i}`).innerText = 'Color not selected.'
            allValid = false;
        } else if(selectedColors.includes(color)){
            document.getElementById(`playerError-${i}`).innerText = 'Players may not have the same color.'
            allValid = false;
        }
        selectedColors.push(color)
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

const resumeHotseatGame = () => {
    const url = new URL(document.location.href);
    url.pathname = 'hotseat';
    url.searchParams.append('resumeGame', true)
    console.log(url)
    window.location.assign(url)
}

const playerNumberOnChange = () => {
    const playerNumber = document.getElementById('playerNumberHotseat').value;
    modifyNumberOfPlayers(parseInt(playerNumber))
}

// here! both of these methods need validation
// let's start by creating the routing in app.js
const startOnline = () => {
    // Need to check that the room doesn't exist
    console.log('startOnline')
}

const joinOnline = () => {
    console.log('joinOnline')
    // Need to check the server if the room exists (eventually use a DB)
    // If it doesn't exist we warn the user and ask them to start a new game
    // Also need to account for it being full
}

const bindButtons = () => {
    document.getElementById('playerNumberHotseat').onchange = playerNumberOnChange;
    document.getElementById('startHotseat').onclick = startHotseatGame;
    document.getElementById('resumeHotseat').onclick = resumeHotseatGame;
    document.getElementById('startOnline').onclick = startOnline;
    document.getElementById('joinOnline').onclick = joinOnline;
    document.getElementById('hotseatToggle').onclick = () => {
        document.getElementById('hotseatConfig').style.display = '';
        document.getElementById('onlineConfig').style.display = 'none';
    }
    document.getElementById('onlineToggle').onclick = () => {
        document.getElementById('hotseatConfig').style.display = 'none';
        document.getElementById('onlineConfig').style.display = '';
    }
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

TEST_PLAYERS.forEach(playerArr => {
    playerColorArray.push(playerArr[1])
});

const createColorPicker = () => {
    const colorPicker = createDivWithClassAndIdAndStyle(['colorPicker'], 'colorPicker', {
        visibility: 'hidden'
    })
    colorOptions.forEach(color => {
        const colorSelector = createDivWithClassAndIdAndStyle(['colorSelection'], color, {
            'backgroundColor': color
        })
        colorSelector.onclick = () => {
            if (pickingColorId !== undefined){
                document.getElementById(`playerColor-${pickingColorId}`).innerHTML = 'Change Color'
                document.getElementById(`playerColor-${ pickingColorId}`).style.backgroundColor = color
                colorPicker.style.visibility = 'hidden'
                playerColorArray[pickingColorId] = color;
                pickingColorId = undefined;
            }
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

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
    createColorPicker(1) // remove this
}
window.onload = start;