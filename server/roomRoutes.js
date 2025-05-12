export const setUpRoomRoutes = (app, roomTrackerMockDB) => {
    app.get("/checkRoom/:roomName", (request, response) => {
        const { roomName } = request.params
        if (!roomTrackerMockDB[roomName]) {
            response.json({
                isValidRoom: false,
                errorMessage: 'That room does not exist.'
            })
        } else if (roomTrackerMockDB[roomName].isFull) {
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
        if (!roomTrackerMockDB[roomName]) {
            console.error(`Attempted to join an unknown room ${roomName}`);
            response.status(404)
            response.send(`A room named "${roomName}" doesn't exist.`)
        } else if (roomTrackerMockDB[roomName].isFull) {
            response.status(400)
            response.send(`The room named "${roomName}" is full.`)
        } else {

            response.json(roomTrackerMockDB[roomName])
            roomTrackerMockDB[roomName].playersWaiting++;
            if (roomTrackerMockDB[roomName].playersWaiting === roomTrackerMockDB[roomName].numberOfPlayers) {
                roomTrackerMockDB[roomName].isFull = true;
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
        if (!roomTrackerMockDB[roomName]) {
            // Happy path, the name doesn't exist
            // May need additional fields
            roomTrackerMockDB[roomName] = {
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
}
