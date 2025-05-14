import { createColorPickerWithOnClick, createDivWithClassAndIdAndStyle, validateName, pluralifyText } from "../helpers/helpers.js"
const roomName = new URL(window.location).searchParams.get('roomName')
let playerColor;
let participantId; // This value is setup by the server
let participants;
let socket;
let otherReadiedPlayers = {};

const attemptToJoinRoom = async () => {
    if (!roomName) {
        console.error('No room name')
        return
    }
    let response;
    try {
        const url = window.location.origin + `/joinRoom/${roomName}`;
        response = await fetch(url, {
            method: 'GET',
        });
    } catch (err) {
        console.error(err)
        return;
    }
    // TODO consider changing this to just an object
    if (response.ok) {
        const responseBody = await response.json();
        handleValidRoom(responseBody);
    } else {
        const responseText = await response.text();
        warnInvalidRoom(responseText)
    }

}

const handleValidRoom = (roomInfo) => {
    document.getElementById('playerInfo').append(createPlayerInputs())
    const colorPicker = createColorPickerWithOnClick((color) => {
        document.getElementById('colorPicker').style.visibility = 'hidden';
        document.getElementById('playerButtonSpan').innerHTML = 'Change Color'
        document.getElementById('playerColor').style.backgroundColor = color
        playerColor = color
    })
    colorPicker.style.position = 'absolute';

    document.getElementById('playerInfo').append(colorPicker)
    const readyUpButton = document.createElement('button');
    readyUpButton.id = 'readyUpButton'
    readyUpButton.innerText = 'Ready Up';
    readyUpButton.onclick = readyUp;
    document.getElementById('playerInfo').append(readyUpButton)

    document.getElementById('waitingHeader').innerText =
        `Waiting to join a ${roomInfo.numberOfPlayers} player game in room "${roomName}".`;

    // We should only set up a websocket with a valid room
    setUpWebSocket();
}

const warnInvalidRoom = (warningText) => {
    document.getElementById('waitingHeader').innerText = `Failed to join "${roomName}"`
    document.getElementById('warningArea').innerText = warningText
    document.getElementById('backButton').style.display = '';
    document.getElementById('backButton').onclick = () => { history.back() };
}

const readyUp = () => {
    // TODO this will need a toggle
    // The unready will be the same as the client disconnecting I think

    const nameInput = document.getElementById('playerName')
    const playerName = nameInput.value;
    const nameValidation = validateName(playerName);
    let isValid = true;
    nameInput.classList.remove('invalidForm')

    document.getElementById('playerError').innerText = '';
    if (!nameValidation[0]) {
        nameInput.classList.add('invalidForm')
        document.getElementById('playerError').innerText = nameValidation[1]
        console.error(nameValidation[1])
        isValid = false;
    }
    if (!playerColor) {
        nameInput.classList.add('invalidForm')
        document.getElementById('playerError').innerText += ' Color must be selected.';
        isValid = false;
    }
    Object.keys(otherReadiedPlayers).forEach((key) => {
        if (otherReadiedPlayers[key].playerColor === playerColor) {
            isValid = false;
            document.getElementById('playerError').innerText +=
                ` ${otherReadiedPlayers[key].playerName} has already selected that color.`;
        }
    })
    if (isValid) {
        sendSocketMessage({
            type: 'readyNameAndColor',
            playerColor,
            participantId,
            playerName,
            roomName,
        })
        togglePlayerReadiedUI(true);
    }
}

const startGame = () => {
    // dev
    const url = new URL(document.location.origin);
    url.pathname = `/onlineGame/${roomName}`
    url.searchParams.append('participantId', participantId)
    if (!URL.canParse(url)) {
        console.error('Can not parse url', url)
        return;
    }
    window.location.assign(url)
}

// ---------------------UI--------------
const createPlayerInputs = () => {
    const playerInfoDiv = createDivWithClassAndIdAndStyle(['playerInfo'], 'playerInfo')
    const playerNameLabel = document.createElement('label')
    playerNameLabel.innerText = 'Your Name: ';
    playerNameLabel.htmlFor = 'playerName'
    const playerNameInput = document.createElement('input')
    playerNameInput.className = 'playerNameInput'
    playerNameInput.id = 'playerName'

    const playerColorButton = document.createElement('button')
    const playerButtonSpan = document.createElement('span')
    playerButtonSpan.id = 'playerButtonSpan'
    playerButtonSpan.innerText = 'Select Color'
    playerColorButton.append(playerButtonSpan)
    playerColorButton.id = 'playerColor'
    playerColorButton.onclick = () => {
        document.getElementById('colorPicker').style.visibility = 'visible'
    }

    const playerErrorDisplay = createDivWithClassAndIdAndStyle(['playerError'], 'playerError');
    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorButton, playerErrorDisplay)

    return playerInfoDiv
}

const createOtherPlayerInfo = (readiedInfo) => {
    const { playerColor, participantId, playerName } = readiedInfo
    const otherPlayerDiv = createDivWithClassAndIdAndStyle(['otherPlayerDiv'], `otherPlayerDiv-${participantId}`)
    otherPlayerDiv.innerText = playerName;
    otherPlayerDiv.style.color = playerColor
    return otherPlayerDiv;
}

const togglePlayerReadiedUI = (isReadied) => {
    document.getElementById('readyUpButton').innerText = isReadied ? 'Cancel Ready Up' : 'Ready Up'
    document.getElementById('readyUpButton').style.color = isReadied ? '#fc3d03' : '';
    document.getElementById('readyUpButton').style.borderColor = isReadied ? '#fc3d03' : '';
    document.getElementById('playerName').disabled = isReadied;
    document.getElementById('playerColor').disabled = isReadied;
}
// -----------------------------Web sockets---------------

const setUpWebSocket = () => {
    const url = `ws://${window.location.hostname}:8080`
    socket = new WebSocket(url); // exposing socket for other methods
    socket.onopen = () => {
        sendSocketMessage({
            type: 'newConnection',
            roomName,
        })
    };
    socket.onmessage = (event) => {
        handleIncomingMessage(event.data);
    };
}

const handleIncomingMessage = (data) => {
    if (typeof data !== 'string') {
        console.error('handleIncomingMessage with non string data')
        return
    }

    const parsedData = JSON.parse(data);
    switch (parsedData.type) {
        case 'participantId':
            participantId = parsedData.participantId;
            console.log(`setting participantId as ${participantId}`)
            break;
        case 'totalParticipants':
            participants = parseInt(parsedData.totalParticipants)
            if (participants === 1) {
                document.getElementById('waitingRoomInfo').innerText = 'You are the only one in the waiting room';
            } else {
                const text = `There ${participants === 2 ? 'is' : 'are'} ${pluralifyText('other player',
                    participants - 1)} in this room.`;
                document.getElementById('waitingRoomInfo').innerText = text;
            }
            break;
        case 'playersReadied':
            document.getElementById('otherReadiedPlayerTitle').innerText = 'Other Players Readied:'

            Object.keys(parsedData.playersReadiedObject).forEach(key => {
                otherReadiedPlayers[key] = {
                    participantId: key,
                    playerColor: parsedData.playersReadiedObject[key].playerColor,
                    playerName: parsedData.playersReadiedObject[key].playerName
                }

                document.getElementById('otherParticipants').append(createOtherPlayerInfo(otherReadiedPlayers[key]))
            })
            break;
        case 'allReady':
            startGame();
            break;
        default:
            console.error(`Unknown socket message type: ${parsedData.type}`)
    }
}

const sendSocketMessage = (messageObject) => {
    const stringifiedMessage = JSON.stringify(messageObject)
    socket.send(stringifiedMessage)
}

// -----------------------------Start---------------------
const start = async () => {
    document.getElementById('waitingHeader').innerText = `Attempting to join "${roomName}"`
    await attemptToJoinRoom();
}
window.onload = start