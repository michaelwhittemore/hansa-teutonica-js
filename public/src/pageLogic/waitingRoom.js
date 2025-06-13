import { createColorPickerWithOnClick, createDivWithClassAndIdAndStyle, validateName, pluralifyText } from "../helpers/helpers.js"
import { createChatInput } from "../helpers/createChatInput.js";
const roomName = new URL(window.location).searchParams.get('roomName')

let participantId; // This value is setup by the server
let participants;
let readiedPlayerName;
let playerColor;
let isReadied = false;

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
    console.log(roomInfo)
    document.getElementById('playerInfo').append(createPlayerInputs())

    document.onclick = (event) => {
        const colorPicker = document.getElementById('colorPicker')
        // Note that we use a different approach than the landing page because the button contains a span
        if (!colorPicker.contains(event.target) && !document.getElementById('playerColor').contains(event.target)) {
            colorPicker.style.visibility = 'hidden';
        }
    }

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
    readyUpButton.onclick = handleReadyUpButton;
    document.getElementById('playerInfo').append(readyUpButton)

    document.getElementById('waitingHeader').innerText =
        `Waiting to join a ${roomInfo.numberOfPlayers} player game in room "${roomName}".`;

    // We should only set up a websocket with a valid room
    setUpWebSocket();
    const onChatSend = (chatText) => {
        addTextToChat(`You say: "${chatText}"`)
        sendSocketMessage({
            type: 'chatMessage',
            chatText,
            senderId: participantId,
            roomName,
            playerName: readiedPlayerName || participantId,
            playerColor: playerColor || 'black,'
        })
    }
    document.getElementById('leftSideWrapper').append(createChatInput(onChatSend))
}

const warnInvalidRoom = (warningText) => {
    document.getElementById('waitingHeader').innerText = `Failed to join "${roomName}"`
    document.getElementById('warningArea').innerText = warningText
    document.getElementById('backButton').style.display = '';
    document.getElementById('backButton').onclick = () => { history.back() };
}

const handleReadyUpButton = () => {
    if (!isReadied) {
        readyUp()
    } else {
        unready()
    }
}

const readyUp = () => {
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
        readiedPlayerName = playerName;
        sendSocketMessage({
            type: 'readyNameAndColor',
            playerColor,
            participantId,
            playerName,
            roomName,
        })
        togglePlayerReadiedUI(true);
        isReadied = true;
    }

}

const unready = () => {
    readiedPlayerName = undefined;
    playerColor = undefined;
    isReadied = false;
    togglePlayerReadiedUI(false)
    sendSocketMessage({
        type: 'unready',
        participantId,
        roomName,
    })
}

const startGame = () => {
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
        if (document.getElementById('colorPicker').style.visibility === 'hidden') {
            document.getElementById('colorPicker').style.visibility = 'visible'
        } else {
            document.getElementById('colorPicker').style.visibility = 'hidden'
        }
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
    if (!isReadied) {
        document.getElementById('playerName').value = '';
        document.getElementById('playerColor').style.backgroundColor = '';
    }

}

const addTextToChat = (text) => {
    const timestamp = (new Date()).toLocaleTimeString('en-US')
    document.getElementById('chatTextHolder').innerHTML += `<br>${timestamp}: ${text}`;
    document.getElementById('chatArea').scrollTop = document.getElementById('chatArea').scrollHeight

}

const handleChatMessage = (parsedData) => {
    const { playerName, chatText, playerColor } = parsedData

    const nameSpan = `<span style='color:${playerColor}'>${playerName}</span>`
    addTextToChat(`${nameSpan} says: "${chatText}"`)
}

const handleUnready = (parsedData) => {
    const { unreadyPlayerId } = parsedData
    delete otherReadiedPlayers[unreadyPlayerId]
    document.getElementById(`otherPlayerDiv-${unreadyPlayerId}`).remove()

    if (Object.keys(otherReadiedPlayers).length === 0) {
        document.getElementById('otherReadiedPlayerTitle').innerText = 'No Other Players Ready';
    }

}

const handleDisconnect = (parsedData) => {
    // dev
    console.log(parsedData)
    // check if they were readied
    addTextToChat(`${parsedData.participantId} disconnected from the waiting room.`)
    // 1. waitingRoomInfo needs to be updated
    // 2. The text message needs to be updated to use name/color when applicable - maybe we have a separate 'unready' function
    // might want to deal with unready first
}
// -----------------------------Web sockets---------------

const setUpWebSocket = () => {
    const url = `ws://${window.location.hostname}:8080/waitingRoom`
    socket = new WebSocket(url);
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
            addTextToChat(`You've joined the waiting room as "${participantId}". Please enter your name and select your color above.`)
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
        case 'incomingChat':
            handleChatMessage(parsedData)
            break;
        case 'playerUnready':
            handleUnready(parsedData);
            break;
        case 'disconnect':
            handleDisconnect(parsedData)
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