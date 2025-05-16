export const messageAllInRoom = (roomName, message, socketMap, idToExclude = undefined) => {
    const Ids = Object.keys(socketMap[roomName].IdsToSockets)
    Ids.forEach(id => {
        if (id !== idToExclude) {
            socketMap[roomName].IdsToSockets[id].send(message)
        }
    })
}