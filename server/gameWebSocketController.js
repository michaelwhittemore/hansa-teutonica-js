// TODO - might need a message queuing system in case people get disconnect or don't join fast enough
// Frankly I'm dreading all the corner cases, it might make sense to see if the WS npm modules has
// any built in solutions 

export const gameWebSocketController = (socket, roomTrackerMockDB, gameRoomToSocketMap) => {
    // TODO - do we actually need to p[ass in the socket to our methods here? I think these
    // are created on a per-socket basis can can get the socket from the outer scope. Note that this
    // isn't true if we start using a helper module
    socket.on('message', (data) => {
        const stringData = data.toString()
        messageFromClientHandler(stringData, socket)
        console.log(`received data:${stringData}`);
    });

    const messageFromClientHandler = (messageString, socket) => {
        const parsedData = JSON.parse(messageString)
        switch (parsedData.type) {
            // here! need to handle the case of a new particpant (and their new socket)
            case 'playerJoinedGame':
                playerJoinedGameHandler(parsedData);
                // maybe we alert everyone else? and they log it?
                // dev, need to have a handler, need to map and need to add the onClosed handler
                break;
            default:
                console.error(`Unknown socket message type from client: ${parsedData.type}`)
        }
    }

    const playerJoinedGameHandler = (parsedData) => {
        const { participantId, roomName } = parsedData
        console.log('playerJoinedGameHandler')
        // dev, use gameRoomToSocketMap on this
        if (!gameRoomToSocketMap[roomName]) {
            gameRoomToSocketMap[roomName] = {
                IdsToSockets: {}
            }
        }
        const waitingRoomObject = gameRoomToSocketMap[roomName]
        // const participantId = shortUUID.generate()
        waitingRoomObject.IdsToSockets[participantId] = socket
    }
}