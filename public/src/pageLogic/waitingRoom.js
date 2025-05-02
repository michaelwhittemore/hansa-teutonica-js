// HERE!
// I think I lost the plot here a little bit.
// What we want to do is warn the user if either the room is full or doesn't exist.
// If it's a valid room we then inform the user how many players the room supports and
// how many open spots there are
// We should then offer them a color picker and a name field (can use the same logic as the waiting room)
// We will need a ready button
// The ready button will make another call to the server. This endpoint will attempt to update the room 
// DB oject with the player's name and color. If a color collision occurs we will need to return that
// information and warn the player to select a new color (maybe add some UI elements to hide already
// selected colors)
// I need to figure out how to listen to incoming events from the server
// IMPORTANT -- I may need to move away from http for signaling
const attemptToJoinRoom = async () => {
    const roomName = new URL(window.location).searchParams.get('roomName')
    if (!roomName){
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
    if (response.ok){
        const responseBody = await response.json();
        console.log(responseBody)
    } else {
        const responseText = await response.text();
        console.log(responseText)
        warnInvalidRoom(responseText)
    }
    
}


const warnInvalidRoom = (warningText) => {
    document.getElementById('warningArea').innerText = warningText
}


const start = async () => {
    await attemptToJoinRoom();
}
window.onload = start