import { createColorPickerWithOnClick, createDivWithClassAndIdAndStyle } from "../helpers/helpers.js"
// IMPORTANT -- I may need to move away from http for signaling - we need  bidirectional communication
const roomName = new URL(window.location).searchParams.get('roomName')

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
// 3. Need to have a name field and import the color picker (maybe it should have a callback param)
// and a ready-up button
// 4. Will need to inform the client how many people are in waiting rooms and how many are ready
// 5. Should have a list of their colors and names 
// 6 If the client successfully joins a room we will need to add a beforeunload_event listener to inform
// the server that the person is leaving (maybe can use websocket instead)
const handleValidRoom = (roomInfo) => {
    // need the color picker to only be visible when the player color button is clicked
    document.getElementById('playerInfo').append(createPlayerInputs())
    document.getElementById('playerInfo').append(createColorPickerWithOnClick((color) => {
        console.log(color)
    }))
    // document.getElementById('colorPicker').style.visibility = 'visible'
    console.warn(roomInfo)
    // Will need to append everything to playerInfo - maybe can use the same thing as landing page?
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
    playerColorButton.id = 'playerColor'
    playerColorButton.innerText = 'Select Color';
    playerColorButton.onclick = () => {
        // here! need to add the color to the element and then hide the colorPicker
        document.getElementById('colorPicker').style.visibility = 'visible'
    }

    const playerErrorDisplay = createDivWithClassAndIdAndStyle(['playerError'], 'playerError');
    playerInfoDiv.append(playerNameLabel, playerNameInput, playerColorButton, playerErrorDisplay)

    return playerInfoDiv
}


const start = async () => {
    document.getElementById('waitingHeader').innerText = `Waiting to join "${roomName}"`
    await attemptToJoinRoom();
}
window.onload = start