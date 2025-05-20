import shortUUID from 'short-uuid';
import { messageAllInRoomFactory } from './webSocketHelpers.js';

export const waitingRoomWebSocketController = (socket, waitingRoomMockDB, waitingRoomToSocketMap) => {
    const messageAllInRoom = messageAllInRoomFactory(waitingRoomToSocketMap)
    socket.on('message', (data) => {
        const stringData = data.toString()
        messageFromClientHandler(stringData, socket)
        console.log(`received data:${stringData}`);
    });

    const joinedWaitingRoom = (socket, roomName) => {
        // dev - this can also be added to a helper
        if (!waitingRoomToSocketMap[roomName]) {
            waitingRoomToSocketMap[roomName] = {
                IdsToSockets: {}
            }
        }
        const individualWaitingRoomObject = waitingRoomToSocketMap[roomName]
        const participantId = shortUUID.generate()
        individualWaitingRoomObject.IdsToSockets[participantId] = socket
        socket.send(JSON.stringify({
            type: 'participantId',
            participantId
        }))
        if (Object.keys(waitingRoomMockDB[roomName].playersReadiedObject).length !== 0) {
            socket.send(JSON.stringify({
                type: 'playersReadied',
                playersReadiedObject: waitingRoomMockDB[roomName].playersReadiedObject
            }))
        }

        messageAllInRoom(roomName, {
            type: 'totalParticipants',
            totalParticipants: Object.keys(individualWaitingRoomObject.IdsToSockets).length
        })

        socket.on('close', () => {
            socketCloseHandler(roomName, participantId)
        })
    }

    const playerReadiedUp = (parsedData) => {
        const {
            playerColor,
            participantId,
            playerName,
            roomName,
        } = parsedData;
        waitingRoomMockDB[roomName].playersReadiedObject[participantId] = {
            playerColor,
            playerName,
            participantId, // not sure if we need this (maybe for removing in the future?)
        }

        messageAllInRoom(roomName, {
            type: 'playersReadied',
            playersReadiedObject: {
                [participantId]: {
                    playerColor,
                    playerName,
                    participantId
                }
            }
        }, participantId)

        if (Object.keys(waitingRoomMockDB[roomName].playersReadiedObject).length === waitingRoomMockDB[roomName].numberOfPlayers) {
            waitingRoomMockDB[roomName].isPlaying = true;
            messageAllInRoom(roomName, {
                type: 'allReady',
            })
        }

    }

    const messageFromClientHandler = (messageString, socket) => {
        const parsedData = JSON.parse(messageString)
        switch (parsedData.type) {
            case 'newConnection':
                {
                    const roomName = parsedData.roomName;
                    joinedWaitingRoom(socket, roomName)
                    break;
                }
            case 'readyNameAndColor':
                playerReadiedUp(parsedData)
                break;
            default:
                console.error(`Unknown socket message type from client: ${parsedData.type}`)
        }

    }

    const socketCloseHandler = (roomName, participantId) => {
        // todo add the closed logic
        // dev
        console.log('participantId closed their socket', participantId, roomName)
    }
}