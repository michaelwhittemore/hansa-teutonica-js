// TODO, perhaps it makes sense to have a factory so that we don't need to pass in roomName and
// Socket map every time?
// Should do the JSN stringification itself

export const messageAllInRoomFactory = (socketMap) => {
    return (roomName, message, idToExclude = undefined) => {
        const messageString = JSON.stringify(message)
        const Ids = Object.keys(socketMap[roomName].IdsToSockets)
        Ids.forEach(id => {
            if (id !== idToExclude) {
                socketMap[roomName].IdsToSockets[id].send(messageString)
            }
        })
    }
}