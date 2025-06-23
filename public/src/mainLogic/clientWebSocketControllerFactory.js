import { logicBundle } from "../helpers/logicBundle.js";

export const clientWebSocketControllerFactory = (participantId, roomName) => {
    const url = `ws://${window.location.hostname}:80/onlineGame`

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
            case 'chatReceived':
                logicBundle.gameController.handleChat(parsedData.senderId, parsedData.chatText)
                break;
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
                    const { cityName, playerId, onlineUsedBonusToken } = actionDetails;
                    logicBundle.gameController.captureCity(cityName, playerId, onlineUsedBonusToken, true)
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
            case 'selectedPostToSwitch':
                {
                    const { cityId, citySpotNumber, playerId, tokenUsageInformation } = actionDetails;
                    logicBundle.gameController.tokenActions.selectedPostToSwitch(cityId, citySpotNumber,
                        playerId, tokenUsageInformation, true)
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
        playerSentChat: (chatText, participantId) => {
            console.warn('Within the playerSentChat in websocket', chatText)
            sendSocketMessage({
                type: 'chatSent',
                participantId,
                roomName,
                chatText
            })
        }
    }
    return webSocketController;
}