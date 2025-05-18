// Some thoughts: This method should be aware of the participantId (maybe the room name, it could
// get that itself but I don't think that's the correct approach)
// I really have no clue how to handle disconnects - at the moment let's just have that be a really
// bad thing
// Need to figure out if this module has access to the gameLog and boardController and playerBoard
// When we receive events what happens?
// I'm pretty sure we shouldn't receive events unless they're valid because otherwise we shouldn't dispatch
// them in the first place
// Need a well defined scope for this module. 
// Should expose methods for the websocket controller so that the game controller may call it
/**
 * It purely exists to communicate to the websocket
 * It is not responsible for validation
 * It handles both incoming and outgoing messages
 * It passes calls to the gameController for the most part
 * It will only pass information to the other classes if there's no logic (i.e. a log message or chat or player joined)
 */

// We may need additional parameters such as the logController
export const clientWebSocketControllerFactory = (participantId, roomName) => {
    const url = `ws://${window.location.hostname}:8080/onlineGame`
    const socket = new WebSocket(url);
    socket.onopen = () => {
        sendSocketMessage({
            type: 'playerJoinedGame',
            roomName,
            participantId,
        })
    };
    socket.onmessage = (event) => {
        handleIncomingMessage(event.data);
    };

    const sendSocketMessage = (messageObject) => {
        const stringifiedMessage = JSON.stringify(messageObject)
        socket.send(stringifiedMessage)
    }

    const handleIncomingMessage = (data) => {
        const parsedData = JSON.parse(data);
        console.log(parsedData)
    }

    const webSocketController = {
        playerTookAction: (actionType, actionDetails) => {
            sendSocketMessage({
                actionType,
                type: 'playerAction',
                participantId,
                actionDetails,
            })
        }
    }
    return webSocketController;
}