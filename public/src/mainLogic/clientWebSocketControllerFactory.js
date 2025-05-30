import { logicBundle } from "../helpers/logicBundle.js";
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
        switch (parsedData.type) {
            case 'playerActionTaken':
                handleActionTaken(parsedData.actionType, parsedData.actionDetails)
                break;
            case 'joinedGameSuccess':
                handleJoinedGameSuccess(parsedData.shuffledRegularTokens, parsedData.shuffledStartingTokens)
                break
            default:
                console.error('Unknown Message type:', parsedData.type)
        }
    }

    const handleActionTaken = (actionType, actionDetails) => {
        console.log(actionDetails)
        switch (actionType) {
            case 'placeWorkerOnNode':
                {
                    const { nodeId, playerId, shape } = actionDetails;
                    logicBundle.gameController.placeWorkerOnNodeAction(nodeId, shape, playerId, true)
                    break;
                }
            case 'captureCity':
                {
                    const { cityName, playerId } = actionDetails;
                    logicBundle.gameController.captureCity(cityName, playerId, true)
                    break;
                }
            case 'replaceTokenAtLocation':
                {
                    const { routeId, playerId } = actionDetails;
                    logicBundle.gameController.replaceTokenAtLocation(routeId, playerId, true)
                    break;
                }
            case 'resupply':
                {
                    const { playerId } = actionDetails;
                    logicBundle.gameController.resupply(playerId, true);
                    break;
                }
            case 'upgradeAtCity':
                {
                    const { playerId, cityName } = actionDetails;
                    logicBundle.gameController.upgradeAtCity(cityName, playerId, true)
                    break;
                }
            case 'movePieceToLocation':
                {
                    const { playerId, targetNodeId, originNodeId } = actionDetails;
                    logicBundle.gameController.movePieceToLocation(targetNodeId, playerId, originNodeId, true)
                    break;
                }
            case 'endMoveAction':
                {
                    const { playerId, movesUsed } = actionDetails;
                    logicBundle.gameController.endMoveAction(playerId, movesUsed, true)
                    break;
                }
            case 'bumpPieceFromNode':
                {
                    const { nodeId, shape, playerId } = actionDetails;
                    logicBundle.gameController.bumpPieceFromNode(nodeId, shape, playerId, true)
                    break;
                }
            case 'placeBumpedPieceOnNode':
                {
                    const { nodeId, shape, bumpedPlayerId } = actionDetails;
                    logicBundle.gameController.placeBumpedPieceOnNode(nodeId, shape, bumpedPlayerId, true)
                    break;
                }
            case 'gainActions':
                {
                    const { playerId, actionsNumber } = actionDetails;
                    logicBundle.gameController.tokenActions.gainActions(playerId, actionsNumber, true)
                    break;
                }
            case 'useFreeUpgrade':
                {
                    const { playerId, upgradeType } = actionDetails;
                    logicBundle.gameController.tokenActions.useFreeUpgrade(upgradeType, playerId, true)
                    break;
                }
            case 'selectMoveThreeLocation':
                {
                    const { playerId, nodeId, tokenUsageInformation } = actionDetails;
                    logicBundle.gameController.tokenActions.selectMoveThreeLocation(nodeId, playerId,
                        tokenUsageInformation, true)
                    break;
                }
            case 'endMoveThree':
                {
                    const { playerId } = actionDetails;
                    logicBundle.gameController.tokenActions.endMoveThree(playerId, true)
                    break;
                }
            default:
                console.error('Unknown action type:', actionType)
        }
    }

    const handleJoinedGameSuccess = (regularTokensArray, startingTokensArray) => {
        logicBundle.gameController.initializeCitiesAndState({
            regularTokensArray,
            startingTokensArray,
        })
    }

    const webSocketController = {
        playerTookAction: (actionType, actionDetails) => {
            sendSocketMessage({
                actionType,
                type: 'playerAction',
                participantId,
                actionDetails,
                roomName,
            })
        },
    }
    return webSocketController;
}