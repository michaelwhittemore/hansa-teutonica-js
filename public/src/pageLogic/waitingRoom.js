// HERE!

const attemptToJoinRoom = async () => {
    const roomName = new URL(window.location).searchParams.get('roomName')
    if (!roomName){
        console.error('No room name')
        return
    }
    let responseBody;
    try {
        const url = window.location.origin + `/joinRoom/${roomName}`;
        console.log(url)
        const response = await fetch(url, {
            method: 'GET',
        });
        console.log(response)
        responseBody = await response.json();
        console.log(responseBody)
    } catch (err) {
        console.error(err)
        return;
    }
    console.log(responseBody)
}

await attemptToJoinRoom();





const start = () => {
    console.log('starting')
}
window.onload = start