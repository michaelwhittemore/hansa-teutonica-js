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

    const unready = (parsedData) => {
        // note that this function may be called as part of disconnect, 
        const { roomName, participantId } = parsedData

        delete waitingRoomMockDB[roomName].playersReadiedObject[participantId]
        messageAllInRoom(roomName, {
            type: 'playerUnready',
            unreadyPlayerId: participantId,
        }, participantId)
    }

    const chatMessageReceived = (parsedData) => {
        const {
            senderId,
            chatText,
            roomName,
            playerColor,
            playerName,
        } = parsedData

        messageAllInRoom(roomName, {
            type: 'incomingChat',
            senderId,
            chatText,
            playerColor,
            playerName,
        }, senderId)
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
            case 'unready':
                unready(parsedData);
                break;
            case 'chatMessage':
                console.warn(parsedData.chatText)
                chatMessageReceived(parsedData)
                break;
            default:
                console.error(`Unknown socket message type from client: ${parsedData.type}`)
        }

    }

    const socketCloseHandler = (roomName, participantId) => {
        // TODO: Consider whether it's worth deleting an empty room
        waitingRoomMockDB[roomName].playersWaiting--;
        waitingRoomMockDB[roomName].isFull = false;

        let disconnectedName;
        let disconnectedColor;
        if (waitingRoomMockDB[roomName].playersReadiedObject[participantId]) {
            disconnectedName = waitingRoomMockDB[roomName].playersReadiedObject[participantId].playerName;
            disconnectedColor = waitingRoomMockDB[roomName].playersReadiedObject[participantId].playerColor;
            unready({ roomName, participantId });
        }

        delete waitingRoomToSocketMap[roomName].IdsToSockets[participantId];
        messageAllInRoom(roomName, {
            type: 'disconnect',
            participantId,
            disconnectedName,
            disconnectedColor,
            totalParticipants: Object.keys(waitingRoomToSocketMap[roomName].IdsToSockets).length
        })

        console.log('participantId closed their socket', participantId, roomName)
    }
}