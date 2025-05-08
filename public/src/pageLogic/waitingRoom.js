import { createColorPickerWithOnClick, createDivWithClassAndIdAndStyle, validateName, pluralifyText } from "../helpers/helpers.js"
// IMPORTANT -- I may need to move away from http for signaling - we need  bidirectional communication
const roomName = new URL(window.location).searchParams.get('roomName')
let playerColor;
let participantID; // This value is setup by the server
let participants;
let socket;
const attemptToJoinRoom = async () => {
    if (!roomName) {
        console.error('No room name')
        return
    }
    let response;
    try {
        const url = window.location.origin + `/joinRoom/${roomName}`;
        console.log(url)
        response = await fetch(url, {
            method: 'GET',
        });
        console.log(response)
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

// here!
// Need to update the client side stuff. 
// ~~1. Need a title to inform the player that they're waiting for the roomName
// ~~2. Need to have an error area and a back button (history.back())
// ~~2. The above should have a method
// ~~3. Need to have a name field and import the color picker (maybe it should have a callback param)
// and a ready-up button
// ~~3. Need the name field to do validation the same way as the landing page when clicking 'ready up'
// ~~3. Need to fix the color picker so it isn't taking up space
// 4. Will need to inform the client how many people are in waiting rooms and how many are ready
// 5. Should have a list of their colors and names 
// 6 If the client successfully joins a room we will need to add a beforeunload_event listener to inform
// the server that the person is leaving (maybe can use websocket instead)
// 7. Need an 'onMessage function'
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
    readyUpButton.innerText = 'Ready Up';
    readyUpButton.onclick = readyUp;
    document.getElementById('playerInfo').append(readyUpButton)
    console.warn(roomInfo)

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
// dev
const readyUp = () => {
    // TODO this will need a toggle
    // The unready will be the same as the client disconnecting I think

    const nameInput = document.getElementById('playerName')
    const playerName = nameInput.value;
    const nameValidation = validateName(playerName);
    let isValid = true;
    console.log(nameValidation)

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
        document.getElementById('playerError').innerText += ' Color must be selected.'
        isValid = false;
    }
    if (isValid){
        // here! message the server
        // may need to include the participantID
        // sendSocketMessage(`$READY_NAME_AND_COLOR:${playerName}:${playerColor}:${participantID}`)
        sendSocketMessage({
            type: 'readyNameAndColor',
            playerColor,
            participantID,
            playerName,
            roomName,
        })
    }
}

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
    console.log('handleIncomingMessage with data', data)
    if (typeof data !== 'string'){
        console.error('handleIncomingMessage with non string data')
        return
    }

    const parsedData = JSON.parse(data);
    console.log(parsedData)
    switch (parsedData.type){
        case 'participantID':
            console.warn('setting participantID to', parsedData.participantID)
            participantID = parsedData.participantID;
            break;
        case 'totalParticipants':
            participants = parseInt(parsedData.totalParticipants)
            if (participants === 1){
                document.getElementById('waitingRoomInfo').innerText = 'You are the only one in the waiting room';
            } else {
                const text = `There ${participants === 2 ? 'is' : 'are'} ${pluralifyText('other player',
                    participants -1)} in this room.`;
                document.getElementById('waitingRoomInfo').innerText = text;
            }
            break;
        case 'playerReadied':
            // here need to add to a readied player display
            // should also exclude color on the color picker
            console.log('another player readied')
            break;
        default: 
            console.error(`Unknown socket message type: ${parsedData.type}`)
    }
}

const sendSocketMessage = (messageObject) => {
    const stringifiedMessage = JSON.stringify(messageObject)
    socket.send(stringifiedMessage)
}


const start = async () => {
    document.getElementById('waitingHeader').innerText = `Attempting to join "${roomName}"`
    await attemptToJoinRoom();
}
window.onload = start