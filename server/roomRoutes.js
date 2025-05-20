export const setUpRoomRoutes = (app, waitingRoomMockDB) => {
    app.get("/checkRoom/:roomName", (request, response) => {
        const { roomName } = request.params
        if (!waitingRoomMockDB[roomName]) {
            response.json({
                isValidRoom: false,
                errorMessage: 'That room does not exist.'
            })
        } else if (waitingRoomMockDB[roomName].isFull) {
            response.json({
                isValidRoom: false,
                errorMessage: 'That room is already full.'
            })
        } else {
            response.json({
                isValidRoom: true,
            })
        }
    })

    app.get('/joinRoom/:roomName', (request, response) => {
        const { roomName } = request.params
        if (!waitingRoomMockDB[roomName]) {
            console.error(`Attempted to join an unknown room ${roomName}`);
            response.status(404)
            response.send(`A room named "${roomName}" doesn't exist.`)
        } else if (waitingRoomMockDB[roomName].isFull) {
            response.status(400)
            response.send(`The room named "${roomName}" is full.`)
        } else {

            response.json(waitingRoomMockDB[roomName])
            waitingRoomMockDB[roomName].playersWaiting++;
            if (waitingRoomMockDB[roomName].playersWaiting === waitingRoomMockDB[roomName].numberOfPlayers) {
                waitingRoomMockDB[roomName].isFull = true;
            }
        }
    })

    app.post("/newRoom", (request, response) => {
        const { numberOfPlayers, roomName } = request.body
        if (!numberOfPlayers || !roomName) {
            const errorMessage = 'Tried to create a new room without number of players or room name.'
            response.status(400)
            response.send(errorMessage)
            return
        }
        // Need to do sanitization here
        if (!waitingRoomMockDB[roomName]) {
            // Happy path, the name doesn't exist
            // May need additional fields
            waitingRoomMockDB[roomName] = {
                isInUse: true, // may be an unnecessary field
                isPlaying: false, // Used to differentiate from waiting room
                isFull: false,
                numberOfPlayers: parseInt(numberOfPlayers),
                playersWaiting: 0,
                playersReadiedObject: {}
            }
            response.send(`Successfully created room ${roomName}`)
        } else {
            // TODO: I think this is the wrong way to use a 400, we should only send an error if the case of invalid values
            response.status(400)
            response.send('Room already exists')
        }

    })
    app.get('/playerInformation/:roomName/:participantId', (request, response) => {
        const { roomName, participantId } = request.params
        response.json(waitingRoomMockDB[roomName].playersReadiedObject[participantId])
    })
    app.get('/playerInformation/:roomName', (request, response) => {
        const { roomName } = request.params
        const playerArray = []
        Object.keys(waitingRoomMockDB[roomName].playersReadiedObject).forEach((key) => {
            playerArray.push(waitingRoomMockDB[roomName].playersReadiedObject[key])
        })
        response.json(playerArray)
    })
}
