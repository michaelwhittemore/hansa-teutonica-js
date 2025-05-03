
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
        console.log(responseBody)
    } else {
        const responseText = await response.text();
        console.log(responseText)
        warnInvalidRoom(responseText)
    }
    // here
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
}

const warnInvalidRoom = (warningText) => {
    document.getElementById('warningArea').innerText = warningText
    document.getElementById('backButton').style.display = '';
    document.getElementById('backButton').onclick = () => { history.back() };
}

const start = async () => {
    document.getElementById('waitingHeader').innerText = `Waiting to Join "${roomName}"`
    await attemptToJoinRoom();
}
window.onload = start