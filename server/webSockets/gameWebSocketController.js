import { messageAllInRoomFactory } from "./webSocketHelpers.js";
// public/src/helpers/constants.js
// server/webSockets
import { REGULAR_TOKENS, STARTING_TOKENS } from "../../public/src/helpers/constants.js"
import { shuffleArray } from "../../public/src/helpers/helpers.js"
// TODO - might need a message queuing system in case people get disconnect or don't join fast enough
// Frankly I'm dreading all the corner cases, it might make sense to see if the WS npm modules has
// any built in solutions 

export const gameWebSocketController = (socket, waitingRoomMockDB, gameRoomToSocketMap, gameRoomMockDB) => {
    const messageAllInRoom = messageAllInRoomFactory(gameRoomToSocketMap);

    socket.on('message', (data) => {
        const stringData = data.toString()
        messageFromClientHandler(stringData, socket)
        console.log(`received data:${stringData}`);
    });

    const messageFromClientHandler = (messageString, socket) => {
        const parsedData = JSON.parse(messageString)
        switch (parsedData.type) {
            case 'playerJoinedGame':
                playerJoinedGameHandler(parsedData, socket);
                break;
            case 'playerAction':
                messageAllInRoom(parsedData.roomName, {
                    type: 'playerActionTaken',
                    actionType: parsedData.actionType,
                    actionDetails: parsedData.actionDetails,
                }, parsedData.participantId)
                break;
            default:
                console.error(`Unknown socket message type from client: ${parsedData.type}`)
        }
    }

    const sendSocketMessage = (messageObject, socket) => {
        const stringifiedMessage = JSON.stringify(messageObject)
        socket.send(stringifiedMessage)
    }

    const playerJoinedGameHandler = (parsedData) => {
        const { participantId, roomName } = parsedData
        if (!gameRoomToSocketMap[roomName]) {
            gameRoomToSocketMap[roomName] = {
                IdsToSockets: {}
            }
        }

        // TODO - perhaps gameRoomToSocketMap should be a property of the room DB??
        if (!gameRoomMockDB[roomName]) {
            const shuffledRegularTokens = shuffleArray(REGULAR_TOKENS);
            const shuffledStartingTokens = shuffleArray(STARTING_TOKENS);
            gameRoomMockDB[roomName] = {
                numberOfPlayers: waitingRoomMockDB[roomName].numberOfPlayers,
                playersObject: waitingRoomMockDB[roomName].playersReadiedObject,
                shuffledRegularTokens,
                shuffledStartingTokens,
            }
        }

        sendSocketMessage({
            type: 'joinedGameSuccess',
            shuffledRegularTokens: gameRoomMockDB[roomName].shuffledRegularTokens,
            shuffledStartingTokens: gameRoomMockDB[roomName].shuffledStartingTokens,
        }, socket);

        gameRoomToSocketMap[roomName].IdsToSockets[participantId] = socket;
    }
}