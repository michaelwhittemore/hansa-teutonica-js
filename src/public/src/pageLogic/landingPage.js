import { TEST_PLAYERS } from "../helpers/constants.js"
import { createDivWithClassAndIdAndStyle, validateName, createColorPickerWithOnClick, addGitHubLink } from "../helpers/helpers.js";

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
    playerNameLabel.htmlFor = `playerName-${id}`;
    const playerNameInput = document.createElement('input')
    playerNameInput.className = 'playerNameInput'
    playerNameInput.id = `playerName-${id}`

    const playerColorButton = document.createElement('button')
    playerColorButton.id = `playerColor-${id}`
    playerColorButton.classList.add('playerColorButtonClass')
    playerColorButton.innerText = 'Select Color';
    playerColorButton.onclick = () => {
        pickingColorId = id;
        if (document.getElementById('colorPicker').style.visibility === 'hidden'){
            document.getElementById('colorPicker').style.visibility = 'visible'
        } else {
            document.getElementById('colorPicker').style.visibility = 'hidden'
        }
        
    }

    const playerErrorDisplay = createDivWithClassAndIdAndStyle(['playerError'], `playerError-${id}`);
    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorButton, playerErrorDisplay)

    return playerInfoDiv
}

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
        if (!playerColorArray[i]) {
            document.getElementById(`playerError-${i}`).innerText = 'Color not selected.'
            allValid = false;
        } else if (selectedColors.includes(color)) {
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

const startOnlineGame = async () => {
    const roomName = document.getElementById('roomName').value
    const numberOfPlayers = document.getElementById('playerNumberOnline').value
    const roomNameValidation = validateName(roomName);

    document.getElementById('roomName').classList.remove('invalidForm')
    if (!roomNameValidation[0]) {
        document.getElementById('roomName').classList.add('invalidForm')
        document.getElementById('roomNameError').innerText = 'Room ' + roomNameValidation[1]
        console.error(roomNameValidation[1])
        return
    }

    let response;
    let responseText;
    try {
        const url = window.location.origin + '/newRoom';
        console.log(url)
        response = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ roomName, numberOfPlayers }),
        });
        responseText = await response.text();
    } catch (err) {
        console.error(err)
    }
    if (!response.ok) {
        console.error('response not ok')
        document.getElementById('roomName').classList.add('invalidForm')
        document.getElementById('roomNameError').innerText = responseText
        return;
    }
    // Happy path, will need to redirect to the waiting room
    const url = new URL(window.location.href);
    url.pathname = 'waitingRoom'
    url.searchParams.append('roomName', roomName)
    console.log(response)
    console.log(responseText)
    if (!URL.canParse(url)) {
        console.error('Can not parse url', url)
        return;
    }
    window.location.assign(url)
}

const joinOnlineGame = async () => {
    const roomName = document.getElementById('roomName').value
    const roomNameValidation = validateName(roomName);

    document.getElementById('roomName').classList.remove('invalidForm')
    if (!roomNameValidation[0]) {
        document.getElementById('roomName').classList.add('invalidForm')
        document.getElementById('roomNameError').innerText = 'Room ' + roomNameValidation[1]
        console.error(roomNameValidation[1])
        return
    }

    let response;
    let responseBody;
    try {
        const url = window.location.origin + `/checkRoom/${roomName}`;
        console.log(url)
        response = await fetch(url, {
            method: 'GET',
        });
        console.log(response)
        responseBody = await response.json();
        console.log(responseBody)
    } catch (err) {
        console.error(err)
        return;
    }
    if (!responseBody.isValidRoom) {
        document.getElementById('roomName').classList.add('invalidForm')
        document.getElementById('roomNameError').innerText = responseBody.errorMessage
    } else {
        // Happy path, will need to redirect to the waiting room
        const url = new URL(window.location.href);
        url.pathname = 'waitingRoom'
        url.searchParams.append('roomName', roomName)
        if (!URL.canParse(url)) {
            console.error('Can not parse url', url)
            return;
        }
        window.location.assign(url)
    }
}

const bindButtons = () => {
    document.getElementById('playerNumberHotseat').onchange = playerNumberOnChange;
    document.getElementById('startHotseat').onclick = startHotseatGame;
    document.getElementById('resumeHotseat').onclick = resumeHotseatGame;
    document.getElementById('startOnline').onclick = startOnlineGame;
    document.getElementById('joinOnline').onclick = joinOnlineGame;
    document.getElementById('hotseatToggle').onclick = () => {
        document.getElementById('hotseatConfig').style.display = '';
        document.getElementById('onlineConfig').style.display = 'none';
    }
    document.getElementById('onlineToggle').onclick = () => {
        document.getElementById('hotseatConfig').style.display = 'none';
        document.getElementById('onlineConfig').style.display = '';
    }
}

TEST_PLAYERS.forEach(playerArr => {
    playerColorArray.push(playerArr[1])
});


const colorOnClick = (color) => {
    if (pickingColorId !== undefined) {
        document.getElementById(`playerColor-${pickingColorId}`).innerHTML = 'Change Color'
        document.getElementById(`playerColor-${pickingColorId}`).style.backgroundColor = color
        document.getElementById('colorPicker').style.visibility = 'hidden'
        playerColorArray[pickingColorId] = color;
        pickingColorId = undefined;
    }
}

let colorPickerClose = (event) => {
    const colorPicker = document.getElementById('colorPicker')
    if (!colorPicker.contains(event.target) && event.target.className !== 'playerColorButtonClass'){
        colorPicker.style.visibility = 'hidden';
    }
}

const start = () => {
    populatePlayerSelection(4)
    populatePlayerSelectionWithDefault();
    bindButtons();
    document.getElementById('hotseatConfig').append(createColorPickerWithOnClick(colorOnClick));
    document.onclick = colorPickerClose;
    addGitHubLink()
}
window.onload = start;
