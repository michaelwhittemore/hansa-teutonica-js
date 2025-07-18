import { logicBundle } from "../helpers/logicBundle.js";
import { Player } from "./PlayerClass.js";
import { clientWebSocketControllerFactory } from "./clientWebSocketControllerFactory.js";
import { FIRST_PLAYER_SQUARES, STARTING_TOKENS, TOKEN_READABLE_NAMES, REGULAR_TOKENS } from "../helpers/constants.js";
import {
    TOKEN_CONFIG_BY_ROUTES, BOARD_CONFIG_CITIES, COELLEN_SPECIAL_LOCATION, COELLEN_SPECIAL_POINTS,
    COELLEN_SPECIAL_COLORS, EAST_WEST_TRACKER_LOCATION, EAST_WEST_POINTS
} from "../helpers/boardMapData.js";
import { getRouteIdFromNodeId, pluralifyText, shuffleArray, } from "../helpers/helpers.js";
import {
    unlockActionsToValue, unlockPurseToValue, unlockColorsToValue,
    unlockMovementToValue, unlockKeysToValue, unlockMapMaxValues
} from "../helpers/playerFieldsMaps.js";
import { createScoreModal } from "../helpers/scoreModal.js";

export const gameControllerFactory = () => {
    const gameController = {
        initializeHotseatGame(playerList) {
            this.createPlayerArrayFromNamesAndColors(playerList);
            this.initializeCitiesAndState();
        },
        initializeOnlineGame(playerList, roomName, participantId) {
            logicBundle.sessionInfo.participantId = participantId; // This is who is actually controlling this client
            this.playerArray = []
            for (let i = 0; i < playerList.length; i++) {
                this.playerArray.push(new Player({
                    color: playerList[i].playerColor,
                    name: playerList[i].playerName,
                    startingPieces: FIRST_PLAYER_SQUARES + i,
                    id: playerList[i].participantId,
                    index: i
                }))
            }
            const controllingPlayer = this.getPlayerById(participantId)
            console.warn(`You are ${controllingPlayer.name} with an id of ${controllingPlayer.id}`)

            this.webSocketController = clientWebSocketControllerFactory(participantId, roomName);
        },
        createPlayerArrayFromNamesAndColors(playerList) {
            // let's just use turn order for IDs (change this to UUIDs in the future)
            // I think we need both an index AND an id
            this.playerArray = []
            for (let i = 0; i < playerList.length; i++) {
                const player = new Player({
                    color: playerList[i][1],
                    name: playerList[i][0],
                    startingPieces: FIRST_PLAYER_SQUARES + i,
                    id: `player-${i}`,
                    index: i
                });
                this.playerArray.push(player)
            }
        },
        initializeCitiesAndState(optionalParameters) {
            // This can be called by an incoming 'joinedGameSuccess' when online
            logicBundle.playerDeskAndInformationController.initializePlayerInfoDesks(this.playerArray)
            logicBundle.turnTrackerController.updateTurnTracker(this.playerArray[0])
            this.currentTurn = 0;
            logicBundle.logController.initializeGameLog();

            let handleChatMessageSend;
            if (logicBundle.sessionInfo.isHotseatMode) {
                handleChatMessageSend = (text) => {
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME said: "${text}"`, this.getActivePlayer())
                }
            } else {
                handleChatMessageSend = (text) => {
                    this.handleChat(logicBundle.sessionInfo.participantId, text)
                    this.webSocketController.playerSentChat(text, logicBundle.sessionInfo.participantId)
                }
            }
            logicBundle.logController.setUpChatInput(handleChatMessageSend)

            // TODO - move these fields into a 'gameState'
            this.routeStorageObject = {}
            this.cityStorageObject = {};
            this.coellenSpecialAreaObject = {};
            this.eastWestStorageObject = {};
            this.moveInformation = {};
            this.bumpInformation = {};
            this.tokenPlacementInformation = {};
            this.tokenUsageInformation = {}
            this.tokensCapturedThisTurn = [];
            this.shouldEndGame = false;
            logicBundle.inputHandlers.bindInputHandlers()
            logicBundle.boardController.initializeUI(this.playerArray);

            const startingTokensArray = optionalParameters?.startingTokensArray ||
                shuffleArray(STARTING_TOKENS);
            this.regularTokensArray = optionalParameters?.regularTokensArray ||
                shuffleArray(REGULAR_TOKENS);
            // it's possible at some point in the far future that there are multiple 
            // board configs (i.e. for three player or alt maps)
            const boardConfig = BOARD_CONFIG_CITIES;
            // Let's break out the city generation into two loops
            // THe first one populates the cityStorageObject 
            // The second one will create the route
            Object.keys(boardConfig).forEach(cityKey => {
                const city = boardConfig[cityKey]
                const cityDiv = logicBundle.boardController.createCity({ ...city })
                // Let's add the city's element to it's properties
                this.cityStorageObject[cityKey] = {
                    cityName: cityKey, // technically kinda useless
                    occupants: [],
                    openSpotIndex: 0,
                    spotArray: city.spotArray,
                    bonusSpotOccupantArray: [],
                    unlock: city.unlock,
                    location: city.location,
                    ownElement: cityDiv,
                    routes: [],
                    freePoint: !!city.freePoint,
                    neighboringCities: [],
                }
            })

            Object.keys(boardConfig).forEach(cityKey => {
                const city = boardConfig[cityKey]
                if (city.neighborRoutes) {
                    city.neighborRoutes.forEach(routeArray => {
                        const neighborCityName = routeArray[0]
                        const length = routeArray[1]
                        const routeId = `${city.name}-${neighborCityName}`

                        let tokenValue = false;
                        if (!TOKEN_CONFIG_BY_ROUTES[routeId]) {
                            console.error(`${routeId} doesn't exist in TOKEN_CONFIG_BY_ROUTES`)
                        }
                        if (TOKEN_CONFIG_BY_ROUTES[routeId][2]) {
                            tokenValue = startingTokensArray.pop()
                        }
                        logicBundle.boardController.createRouteAndTokenFromLocations({
                            length: routeArray[1],
                            id: routeId,

                            element1: this.cityStorageObject[cityKey].ownElement,
                            element2: this.cityStorageObject[neighborCityName].ownElement,
                            tokenDirection: TOKEN_CONFIG_BY_ROUTES[routeId],
                            isStartingToken: !!TOKEN_CONFIG_BY_ROUTES[routeId][2],
                            tokenValue,
                        })

                        this.routeStorageObject[routeId] = {
                            cities: [cityKey, neighborCityName],
                            routeNodes: {},
                            token: tokenValue,
                            // #FFC000 = yellowGold
                            tokenColor: tokenValue ? '#FFC000' : 'silver'
                        }
                        // Cities should track which routes they are a part of
                        const addRoutesToCity = (cityName) => {
                            const cityToModify = this.cityStorageObject[cityName]
                            if (!cityToModify.routes.includes(routeId)) {
                                cityToModify.routes.push(routeId)
                            }
                        }
                        addRoutesToCity(cityKey)
                        addRoutesToCity(neighborCityName)

                        // Notes that this logic assumes that the board config only has one neighborRoute I.E. 
                        // We have Alpha -> Beta but NOT  Beta -> Alpha
                        this.cityStorageObject[cityKey].neighboringCities.push(neighborCityName)
                        this.cityStorageObject[neighborCityName].neighboringCities.push(cityKey)

                        for (let i = 0; i < length; i++) {
                            const nodeId = `${routeId}-${i}`
                            this.routeStorageObject[routeId].routeNodes[nodeId] = {
                                nodeId,
                                occupied: false,
                                shape: undefined,
                                color: undefined,
                                playerId: undefined,
                            }
                        }
                    })
                }
            })
            logicBundle.boardController.createCoellenSpecialArea(COELLEN_SPECIAL_LOCATION);
            logicBundle.boardController.createEastWestPointTracker(EAST_WEST_TRACKER_LOCATION)
            // dev DELETE THIS (I just wanted to be able to see all the tokens when adding new cities)
            // logicBundle.boardController.toggleAllTokenLocations(Object.keys(this.routeStorageObject), 'visible')
        },
        getActivePlayer() {
            // This works because we're using the index of the player
            return this.playerArray[this.currentTurn % this.playerArray.length]
        },
        getPlayerById(id) {
            for (let player of this.playerArray) {
                if (player.id === id) {
                    return player
                }
            }
        },
        handleChat(senderId, chatText) {
            if (senderId === logicBundle.sessionInfo.participantId) {
                logicBundle.logController.addTextToGameLog(`You said: "${chatText}"`)
            } else {
                const sender = this.getPlayerById(senderId)
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME said: "${chatText}"`, sender)
            }
            console.log(chatText)
        },
        advanceTurn(lastPlayer) {
            logicBundle.turnTrackerController.updateTurnTracker(lastPlayer)
            if (this.tokensCapturedThisTurn.length > 0) {
                this.tokenPlacementInformation.tokensToPlace = this.tokensCapturedThisTurn.length;
                this.replaceTokens(lastPlayer)
                return
            }
            this.tokenPlacementInformation = {}
            this.tokenUsageInformation = {}
            this.currentTurn++;
            logicBundle.turnTrackerController.updateTurnTracker(this.getActivePlayer())
            if (logicBundle.sessionInfo.isHotseatMode) {
                // This is fine, don't need to focus on other players
                logicBundle.playerDeskAndInformationController.focusOnPlayerDesk(this.getActivePlayer(), this.playerArray)
            }
            lastPlayer.currentActions = lastPlayer.maxActions;
            const shouldEnableInputButtons = this.shouldEnableInputButtons()
            logicBundle.inputHandlers.toggleInputButtons(!shouldEnableInputButtons)
            this.saveGame();
        },
        replaceTokens(player) {
            if (this.regularTokensArray.length === 0) {
                this.endGame()
                return;
            }
            const currentReplacement = this.regularTokensArray.pop()
            this.tokenPlacementInformation.currentReplacement = currentReplacement;
            const tokensToPlace = this.tokenPlacementInformation.tokensToPlace

            logicBundle.turnTrackerController.updateTurnTrackerWithTokenInfo(player, currentReplacement, tokensToPlace)

            const shouldHideTokenText = !logicBundle.sessionInfo.isHotseatMode && player.id !==
                logicBundle.sessionInfo.participantId;
            logicBundle.inputHandlers.setUpTokenActionInfo(currentReplacement, shouldHideTokenText);

            logicBundle.boardController.toggleAllTokenLocations(Object.keys(this.routeStorageObject), 'visible')
        },
        replaceTokenAtLocation(routeId, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            if (this.routeStorageObject[routeId].token) {
                console.warn('That location already has a token.');
                logicBundle.inputHandlers.warnInvalidAction('That location already has a token.')
                return;
            }

            for (let nodeId in this.routeStorageObject[routeId].routeNodes) {
                if (this.routeStorageObject[routeId].routeNodes[nodeId].occupied) {
                    console.warn('Route must be unoccupied.')
                    logicBundle.inputHandlers.warnInvalidAction('Route must be unoccupied.');
                    return;
                }
            }
            // Tokens can only be placed on routes where there are open endpoints
            let citiesHaveFreeSpot = false
            this.routeStorageObject[routeId].cities.forEach(cityName => {
                const city = this.cityStorageObject[cityName];
                if (city.openSpotIndex < city.spotArray.length) {
                    citiesHaveFreeSpot = true;
                }
            })
            if (!citiesHaveFreeSpot) {
                console.warn('City endpoints must have at least one open spot among them.')
                logicBundle.inputHandlers.warnInvalidAction('City endpoints must have at least one open spot among them.');
                return;
            }

            logicBundle.boardController.addTokenToRoute(routeId, this.tokenPlacementInformation.currentReplacement, 'silver')

            this.routeStorageObject[routeId].token = this.tokenPlacementInformation.currentReplacement;
            this.routeStorageObject[routeId].tokenColor = 'silver'

            this.tokenPlacementInformation.tokensToPlace--;

            logicBundle.playerDeskAndInformationController.componentBuilders.updateTokenTracker(player,
                this.tokenPlacementInformation.tokensToPlace);

            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME placed a ${this.tokenPlacementInformation.currentReplacement}
            token at ${routeId}.`, player);
            // 9. This is where we check the tokensToPlace and have different behavior
            // ----------------Continuing (tokensToPlace > 0)-----------------

            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('replaceTokenAtLocation', {
                    playerId,
                    routeId,
                })
            }
            if (this.tokenPlacementInformation.tokensToPlace > 0) {
                this.replaceTokens(player);
                console.log('There are more tokens to place, repeating the process')
                return;
            } else {
                // ------------------------ Ending (tokensToPlace === 0)--------------------
                // 14. Consider breaking this out into a different method
                // 15. clear the UI, both actionInformation and turn tracker
                logicBundle.inputHandlers.clearAllActionSelection();
                // I think buttons should be updated and turn tracker info cleared by end turn?
                // 15. hide all tokensLocations (visibility=hidden) that aren't full
                const emptyRouteIds = []
                for (let key in this.routeStorageObject) {
                    if (!this.routeStorageObject[key].token) {
                        emptyRouteIds.push(key)
                    }
                }
                logicBundle.boardController.toggleAllTokenLocations(emptyRouteIds, 'hidden')
                this.tokensCapturedThisTurn = [];
                gameController.tokenPlacementInformation = {}
                logicBundle.inputHandlers.clearAllActionSelection();
                if (this.shouldEnableInputButtons()) {
                    logicBundle.inputHandlers.toggleInputButtons(false)
                }
                this.advanceTurn(player);

                // 16. clear the this.tokenPlacementInformation blob
                // 17. Clear the selected action
                // 18. Double check that there's no cleanup steps from resolveAction that are being missed
                // 16. Call this.advanceTurn(player)
            }
        },
        resolveAction(player) {
            gameController.moveInformation = {};
            gameController.bumpInformation = {};
            gameController.tokenPlacementInformation = {}
            gameController.tokenUsageInformation = {}
            logicBundle.inputHandlers.clearAllActionSelection();
            // TODO The below logicBundle.inputHandlers.toggleInputButtons maybe should just be tied to cleanup of
            // the input handlers? Like clearAllActionSelection?
            if (this.shouldEnableInputButtons()) {
                logicBundle.inputHandlers.toggleInputButtons(false)
            }
            player.currentActions -= 1;
            if (player.currentActions === 0) {
                this.advanceTurn(player);
            }
            logicBundle.turnTrackerController.updateTurnTracker(this.getActivePlayer())
            this.playerArray.forEach(player => {
                logicBundle.playerDeskAndInformationController.componentBuilders.updateSupplyAndBank(player)
            })
            if (this.shouldEndGame) {
                this.endGame()
            }
        },
        handleCoellenSpecialAreaClick(spotNumber, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            const pointValue = COELLEN_SPECIAL_POINTS[spotNumber];
            const requiredColor = COELLEN_SPECIAL_COLORS[spotNumber];

            if (this.coellenSpecialAreaObject[spotNumber]) {
                console.warn(`The ${pointValue} spot is already occupied.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`The ${pointValue} spot is already occupied.`)
                return;
            }
            if (!player.unlockedColors.includes(requiredColor)) {
                console.warn(`You haven't unlocked ${requiredColor}.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`You haven't unlocked ${requiredColor}.`)
                return
            }
            const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, 'Coellen')
            if (!routeCheckOutcome) {
                console.warn('You do not have a completed route to Coellen.')
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('You do not have a completed route to Coellen.');
                return;
            };
            if (routeCheckOutcome.circle === 0) {
                console.warn('You do not have a merchant (circle) in this route.')
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('You do not have a merchant (circle) in this route.');
                return;
            }

            player.bankedCircles += routeCheckOutcome.circle - 1;
            player.bankedSquares += routeCheckOutcome.square;

            logicBundle.boardController.addPieceToCoellenSpecialArea(spotNumber, player.color)
            this.coellenSpecialAreaObject[spotNumber] = {
                ownerId: player.id,
                pointValue,
                color: player.color,
            }
            console.log(this.coellenSpecialAreaObject)
            this.routeCompleted('Warburg-Coellen', player)

            logicBundle.logController.addTextToGameLog(
                `$PLAYER1_NAME claimed a special points circle in Coellen. It will be worth ${pointValue} at the end of the game.`,
                player);
            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('coellenSpecialCapture', {
                    playerId,
                    spotNumber,
                })
            }
            this.resolveAction(player);

        },
        placeWorkerOnNodeAction(nodeId, shape, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            // Validate that the player has enough supply and that the node is unoccupied
            const playerShapeKey = shape === 'square' ? 'supplySquares' : 'supplyCircles';
            if (player[playerShapeKey] < 1) {
                console.warn(`Not enough ${shape}s in your supply`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`Not enough ${shape}s in your supply!`)
                return
            }
            const routeId = getRouteIdFromNodeId(nodeId);
            if (this.routeStorageObject[routeId]?.routeNodes[nodeId]?.occupied) {
                console.warn('That route node is already occupied!')
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('That route node is already occupied!')
                return
            }

            player[playerShapeKey] -= 1;
            this.placePieceOnNode(nodeId, shape, player);
            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME placed a ${shape} on ${nodeId}`, player)

            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('placeWorkerOnNode', {
                    playerId,
                    nodeId,
                    shape,
                })
            }

            this.resolveAction(player)
        },
        placePieceOnNode(nodeId, shape, player) {
            // This just updates the storage node and the game map. It doesn't subtract from player supply
            // It also assumes the target node is empty
            const routeId = getRouteIdFromNodeId(nodeId);
            const updatedProps = {
                occupied: true,
                shape,
                color: player.color,
                playerId: player.id,
            };
            Object.assign(this.routeStorageObject[routeId].routeNodes[nodeId], updatedProps)
            logicBundle.boardController.addPieceToRouteNode(nodeId, player.color, shape);

        },
        selectPieceToMove(nodeId, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            const routeId = getRouteIdFromNodeId(nodeId)
            const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]

            if (!node.occupied || node.playerId !== playerId) {
                console.warn('You do not have a piece on this route node.')
                logicBundle.inputHandlers.warnInvalidAction('You do not have a piece on this route node.');
                return;
            } else {
                if (gameController.moveInformation.movesUsed === undefined) {
                    gameController.moveInformation.movesUsed = 0;
                }

                logicBundle.inputHandlers.additionalInfo = 'selectLocationToMoveTo'
                logicBundle.inputHandlers.updateActionInfoText(`You have a selected a ${node.shape}. Select an unoccupied route node to move there.`)
                gameController.moveInformation.originNode = node;
            }
        },
        movePieceToLocation(targetNodeId, playerId, originNodeId = false, isOnlineAction = false) {
            // We make a deliberate choice not to attempt to sync gameController.moveInformation
            // in the case of online play. This is because the object contains references to specific
            // nodes and consequently it's not as simple as an assignment. Perhaps in the future
            // we could get the nodes by Id and assign them to the moveInformation.
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            const routeId = getRouteIdFromNodeId(targetNodeId)
            const targetNode = gameController.routeStorageObject[routeId].routeNodes[targetNodeId]

            let originNode
            if (originNodeId) {
                const originRouteId = getRouteIdFromNodeId(originNodeId)
                originNode = gameController.routeStorageObject[originRouteId].routeNodes[originNodeId];
            } else {
                originNode = gameController.moveInformation.originNode;
            }

            const shape = originNode.shape
            if (targetNode.occupied) {
                console.warn('This route node is already occupied.')
                logicBundle.inputHandlers.warnInvalidAction('This route node is already occupied.');
                return;
            }

            this.placePieceOnNode(targetNodeId, shape, player);

            logicBundle.logController.addTextToGameLog(
                `$PLAYER1_NAME moved a ${shape} from ${originNode.nodeId} to ${targetNodeId}`, player)
            const clearedProps = {
                occupied: false,
                shape: undefined,
                color: undefined,
                playerId: undefined,
            };
            Object.assign(originNode, clearedProps);
            logicBundle.boardController.clearPieceFromRouteNode(originNode.nodeId)

            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('movePieceToLocation', {
                    playerId,
                    targetNodeId,
                    originNodeId: originNode.nodeId
                })
            }

            gameController.moveInformation.movesUsed++;
            if (gameController.moveInformation.movesUsed === player.maxMovement) {
                console.warn('used up all move actions')
                this.endMoveAction(playerId)
                return;
            }
            if (!isOnlineAction) {
                logicBundle.inputHandlers.updateActionInfoText(
                    `Select one of your own pieces to move. You have ${player.maxMovement - gameController.moveInformation.movesUsed} left.`)
                logicBundle.inputHandlers.additionalInfo = 'selectPieceToMove';
            } else {
                logicBundle.inputHandlers.updateActionInfoText(
                    `${player.name} is using a move action.`)
            }
        },
        endMoveAction(playerId, optionalMovesUsed = false, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            if (this.shouldEnableInputButtons()) {
                logicBundle.inputHandlers.toggleInputButtons(false)
            }
            const movesUsed = optionalMovesUsed || this.moveInformation.movesUsed

            // The player never actually took an action, works for zero or undefined
            if (!movesUsed) {
                logicBundle.inputHandlers.clearAllActionSelection()
                return;
            } else {
                logicBundle.logController.addTextToGameLog(
                    `$PLAYER1_NAME moved ${movesUsed} pieces.`, player)
                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    this.webSocketController.playerTookAction('endMoveAction', {
                        playerId,
                        movesUsed,
                    })
                }
                this.resolveAction(player)
            }
        },
        resupply(playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            logicBundle.inputHandlers.clearAllActionSelection();
            if (player.bankedCircles === 0 && player.bankedSquares === 0) {
                console.warn('There is nothing in your bank to resupply with.')
                logicBundle.inputHandlers.warnInvalidAction('There is nothing in your bank to resupply with.')
                return;
            }
            let resuppliedCircles;
            let resuppliedSquares;
            if (player.purse === 'All') {
                player.supplyCircles += player.bankedCircles;
                resuppliedCircles = player.bankedCircles;
                player.bankedCircles = 0;

                player.supplySquares += player.bankedSquares;
                resuppliedSquares = player.bankedSquares;
                player.bankedSquares = 0;
            } else {
                let restocks = player.purse;
                resuppliedCircles = Math.min(player.bankedCircles, restocks);
                player.supplyCircles += resuppliedCircles;
                player.bankedCircles -= resuppliedCircles;
                restocks -= resuppliedCircles;
                resuppliedSquares = Math.min(player.bankedSquares, restocks);
                player.supplySquares += resuppliedSquares;
                player.bankedSquares -= resuppliedSquares;
            }
            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME resupplied ${resuppliedCircles} circles and ${resuppliedSquares} squares.`, player);
            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('resupply', {
                    playerId,
                })
            }
            this.resolveAction(player)
            // eventually should chose circles vs squares, right now default to all circles, then square
        },
        bumpPieceFromNode(nodeId, shape, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            // 1. First verify that another player controls this location - if not warn and return
            const routeId = getRouteIdFromNodeId(nodeId)
            const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]

            if (!node.occupied || node.playerId === playerId) {
                console.warn('The route node needs to be occupied by a rival player.')
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('The route node needs to be occupied by a rival player.')
                return
            }
            // 3. If so need to calculate number of piece to be return to bank (include the piece being placed)
            const bumpedPlayerId = node.playerId;
            const bumpedShape = node.shape;
            let squareCost = 1;
            let circleCost = 0;
            let circlesToPlace = 0; // This is only used for the turnTrackerAdditionalInformation UI
            let squaresToPlace = 2; // Note that is this always two assuming a full bank
            // IMPORTANT -- Looks like rules may not be as cut and dry as I thought, see page four
            // in the top right corner- can take out personal supply if bank isn't available
            if (bumpedShape === 'circle') {
                squareCost++;
                circlesToPlace++;
            };
            // Update the cost to include the piece being placed
            if (shape === 'square') {
                squareCost++;
            } else {
                circleCost++;
            }
            // 4. Check that the player has sufficient supply - if not warn and end
            if (player.supplySquares < squareCost || player.supplyCircles < circleCost) {
                console.warn(`You need at least ${squareCost} squares and ${circleCost} circles in your supply`)
                // logicBundle.inputHandlers.clearAllActionSelection(); // TODO this is wrong, don't clear the selection
                logicBundle.inputHandlers.warnInvalidAction(`You need at least ${squareCost} squares and ${circleCost} circles in your supply`);
                return
            }
            // 5. If they do, move the tax from supply to bank (also account for the piece being moved)
            player.supplySquares -= squareCost;
            player.bankedSquares += squareCost;
            player.supplyCircles -= circleCost;
            player.bankedCircles -= circleCost;
            if (shape === 'square') {
                player.bankedSquares--;
            } else {
                player.bankedCircles++;
            }
            // 6. Remove opponent piece (make sure it store it in the bump information property)
            const clearedProps = {
                occupied: false,
                shape: undefined,
                color: undefined,
                playerId: undefined,
            };
            Object.assign(node, clearedProps);
            logicBundle.boardController.clearPieceFromRouteNode(nodeId)
            this.bumpInformation.bumpedShape = bumpedShape;
            this.bumpInformation.bumpedLocation = nodeId;
            this.bumpInformation.bumpingPlayer = player;
            this.bumpInformation.bumpedPlayer = this.getPlayerById(bumpedPlayerId);
            this.bumpInformation.freePiece = true;
            this.bumpInformation.circlesToPlace = circlesToPlace;
            this.bumpInformation.squaresToPlace = squaresToPlace;

            // 8. Then we place the active player piece and update the nodeStorage object
            this.placePieceOnNode(nodeId, shape, player);

            // 9. Then we update the active player info area to make it clear that we're in a weird half-turn
            // We already have turnTrackerAdditionalInformation
            logicBundle.turnTrackerController.updateTurnTrackerWithBumpInfo({
                bumpingPlayer: player,
                bumpedPlayer: this.getPlayerById(bumpedPlayerId),
                circlesToPlace,
                squaresToPlace
            })
            // 12. Then update inputHandler.selectedAction
            logicBundle.inputHandlers.clearAllActionSelection();
            logicBundle.inputHandlers.selectedAction = 'placeBumpedPiece';

            // We don't want a tertiary player to see the text telling them that they've been bumped
            const shouldAddText = logicBundle.sessionInfo.isHotseatMode ||
                (isOnlineAction && bumpedPlayerId === logicBundle.sessionInfo.participantId);
            logicBundle.inputHandlers.setUpBumpActionInfo({
                nodeId,
                shape: bumpedShape,
                squares: squaresToPlace,
                circles: circlesToPlace,
                shouldAddText,
            });

            // nodeId, shape, squares, circles
            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('bumpPieceFromNode', {
                    playerId,
                    nodeId,
                    shape,
                })
            }
        },
        placeBumpedPieceOnNode(nodeId, shape, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.bumpInformation.bumpedPlayer)
            if (!player) {
                return
            }

            // We can think of validation in three parts location, number of earned moves, and supply
            // 1. Check that the target node is empty. If not warn
            const routeId = getRouteIdFromNodeId(nodeId)
            const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]
            if (node.occupied) {
                console.warn('This route node is already occupied.')
                logicBundle.inputHandlers.warnInvalidAction('This route node is already occupied.');
                return;
            }

            const isValidNode = this.checkThatLocationIsAdjacent(this.bumpInformation.bumpedLocation, nodeId)
            if (!isValidNode) {
                console.warn('Selected node must be part of an adjacent route')
                logicBundle.inputHandlers.warnInvalidAction('Selected node must be part of an adjacent route');
                return;
            }
            // 3. check that the shape is valid (will need bumpInformation) which will need to be updated
            // once all validation has occurred
            if (shape === 'circle' && this.bumpInformation.circlesToPlace === 0) {
                console.warn('You cannot place another circle.')
                logicBundle.inputHandlers.warnInvalidAction('You cannot place another circle.');
                return;
            }
            if (shape === 'square' && this.bumpInformation.squaresToPlace === 0) {
                console.warn('You cannot place another square.')
                logicBundle.inputHandlers.warnInvalidAction('You cannot place another square.');
                return;
            }
            // 3. Check if the player has used their free shape - if so clear it
            if (this.bumpInformation.freePiece && shape === this.bumpInformation.bumpedShape) {
                this.bumpInformation.freePiece = false;
            } else {
                // We should never be using the supply/bank for circles I think
                if (shape === 'circle') {
                    console.error('Trying to place an un-free circle')
                }
                if (player.bankedSquares === 0) {
                    if (player.supplySquares === 0) {
                        // We shouldn't reach here - this is a soft lock
                        // TODO eventually ad a relocation option
                        console.error('You have no squares in your bank or supply.')
                        logicBundle.inputHandlers.warnInvalidAction('You have no squares in your bank or supply.');
                        return;
                    } else {
                        player.supplySquares--;
                    }
                } else {
                    player.bankedSquares--;
                }

            }
            // 6. Use the place method I created on the gameController for move to place the piece
            this.placePieceOnNode(nodeId, shape, player);
            // 7. Bump place resolution:
            // 8. Update gameController.bumpInfo
            if (shape === 'circle') {
                this.bumpInformation.circlesToPlace--;
            } else if (shape === 'square') {
                this.bumpInformation.squaresToPlace--;
            }

            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('placeBumpedPieceOnNode', {
                    bumpedPlayerId: player.id,
                    nodeId,
                    shape,
                })
            }

            // Two situations trigger bump end - out of moves or out of available pieces
            const outOfMoves = (this.bumpInformation.circlesToPlace + this.bumpInformation.squaresToPlace) === 0;
            const outOfPieces = !this.bumpInformation.free && ((player.bankedSquares + player.supplySquares) === 0);

            if (outOfMoves || outOfPieces) {
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME displaced $PLAYER2_NAME at ${nodeId}`,
                    this.bumpInformation.bumpingPlayer, player)
                this.resolveAction(this.bumpInformation.bumpingPlayer)
                // TODO should we consider all nodeIds/shapes and logging them as well
                return;
            }
            // 10. If they still have any moves left we update the turnTracker and the BumpActionInfo on
            // the inputHandler

            logicBundle.inputHandlers.setUpBumpActionInfo({
                nodeId,
                shape: this.bumpInformation.bumpedShape,
                squares: this.bumpInformation.squaresToPlace,
                circles: this.bumpInformation.circlesToPlace,
                shouldAddText: !isOnlineAction,
            });
            logicBundle.turnTrackerController.updateTurnTrackerWithBumpInfo({
                bumpingPlayer: this.bumpInformation.bumpingPlayer,
                bumpedPlayer: player,
                circlesToPlace: this.bumpInformation.circlesToPlace,
                squaresToPlace: this.bumpInformation.squaresToPlace,
            })
            // 11. We also should update the player area to show their current bank and supply
            logicBundle.playerDeskAndInformationController.componentBuilders.updateSupplyAndBank(player)
        },
        checkThatLocationIsAdjacent(bumpedNodeId, targetNodeId) {
            // TODO Maybe we eventually move this out of the boardController and pass in the map instead? TODO

            // We are starting from the displaced node and radiating outward, check each un-checked route for 
            // either a matching routeId or a route with an unoccupied node (without finding a match on
            // that iteration number)
            const hasAnUnoccupiedNode = (route) => {
                let unoccupied = false;
                for (let nodeId in route.routeNodes) {
                    if (!route.routeNodes[nodeId].occupied) {
                        unoccupied = true;
                    }
                }
                return unoccupied;
            }
            const startingRouteId = getRouteIdFromNodeId(bumpedNodeId);
            const targetRouteId = getRouteIdFromNodeId(targetNodeId);

            const alreadyVisitedRoutes = [];
            let routesToChecks = [];
            let routesToChecksNext = [startingRouteId];

            let failSafe = 0;
            while (true) {
                routesToChecks = routesToChecksNext;
                routesToChecksNext = [];
                if (failSafe > 35) {
                    console.error('Infinite loop in checkThatLocationIsAdjacent, breaking out')
                    return;
                }
                // I'm not using forEach because then 'return' wouldn't break us out of the while loop
                let hadAnUnoccupiedNode = false;
                for (let routeId of routesToChecks) {
                    if (!alreadyVisitedRoutes.includes(routeId)) {
                        alreadyVisitedRoutes.push(routeId)
                    } else {
                        // We've already visited this route we don't need to check again
                        continue;
                    }
                    if (routeId === targetRouteId) {
                        console.warn(`Found a match after ${failSafe} completed loops`)
                        return true
                    }
                    const route = gameController.routeStorageObject[routeId];
                    // Need to get neighboring routes by using the route's city
                    // From there we add the route's city's routes to routes to visit 
                    route.cities.forEach(cityName => {
                        const city = gameController.cityStorageObject[cityName]
                        city.routes.forEach(innerRouteId => {
                            if (!routesToChecksNext.includes(innerRouteId) && innerRouteId !== routeId) {
                                routesToChecksNext.push(innerRouteId);
                            }
                        })
                    });
                    if (hasAnUnoccupiedNode(route)) {
                        hadAnUnoccupiedNode = true;
                        console.warn(`${routeId} had an unoccupied node`)
                    }

                }
                if (hadAnUnoccupiedNode) {
                    console.warn(`Found a hadAnUnoccupiedNode after ${failSafe} completed loops`)
                    return false
                }
                failSafe++;
            }
        },
        captureCity(cityName, playerId, onlineUsedBonusToken = false, isOnlineAction = false) {
            // TODO Eventually we will need to deal with a player who has multiple completed routes to a single city
            // probably use an onclick for a route node. Let's deal with that later
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            logicBundle.inputHandlers.clearAllActionSelection();
            const city = this.cityStorageObject[cityName]

            const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
            const { routeId } = routeCheckOutcome
            if (!routeCheckOutcome) {
                console.warn('You do not have a completed route')
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('You do not have a completed route');
                return;
            };
            if (player.currentActions === 0) {
                // I don't think we should reach here???
                console.error('You don\'t have enough actions, how did you even get here? The turn was supposed to advance!')
                return;
            }
            if (city.openSpotIndex === city.spotArray.length) {
                console.warn(`The city of ${city.cityName} is already full.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`The city of ${city.cityName} is already full.`);
                return;
            }
            const [targetShape, targetColor] = city.spotArray[city.openSpotIndex]
            if (!player.unlockedColors.includes(targetColor)) {
                console.warn(`You haven't unlocked ${targetColor}.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`You haven't unlocked ${targetColor}.`);
                return
            }
            if (routeCheckOutcome[targetShape] === 0) {
                console.warn(`You don't have a ${targetShape} in your route.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`You don't have a ${targetShape} in your route.`);
                return
            }
            if (city.freePoint) {
                city.freePoint = false;
                this.scorePoints(1, player)
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME collected the free point at ${cityName}`, player)

            }
            logicBundle.boardController.addPieceToCity(city, player.color)
            routeCheckOutcome[targetShape]--;

            player.bankedCircles += routeCheckOutcome.circle;
            player.bankedSquares += routeCheckOutcome.square;

            // We need to do route completion first for point calculation
            this.routeCompleted(routeId, player);
            city.occupants.push(playerId);
            city.openSpotIndex++;

            // We don't bother checking if the player has already claimed their points or if all
            // three spots have already been taken
            if (!player.hasCompletedEastWestRoute && Object.keys(this.eastWestStorageObject).length < 3) {
                if (this.checkEastWestRouteByPlayerId(playerId)) {
                    this.eastWestRouteCompleted(player)
                }
            } else {
                // CAN DELETE THIS ELSE BLOCK
                console.log('player.hasCompletedEastWestRoute', player.hasCompletedEastWestRoute)
                console.log('Object.keys(this.eastWestStorageObject).length', Object.keys(this.eastWestStorageObject).length)
            }

            let didUseABonusPost = false;
            if (this.tokenUsageInformation.tokenAction === 'bonusPost' || onlineUsedBonusToken) {
                console.warn(`Trying to capture ${cityName} with an additional post`)
                let usedShape;
                if (player.bankedSquares > 0) {
                    usedShape = 'square';
                    player.bankedSquares--;
                } else {
                    usedShape = 'circle';
                    player.bankedCircles--;
                }
                gameController.cityStorageObject[cityName].bonusSpotOccupantArray.push([playerId, usedShape])
                // We subtract one from the length as we're including itself
                logicBundle.boardController.addBonusPieceToCity(city, player.color, usedShape,
                    city.bonusSpotOccupantArray.length - 1)

                gameController.finishTokenUsage(player, 'bonusPost')
                didUseABonusPost = true;
            }

            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME captured the city of ${cityName}.`, player);
            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('captureCity', {
                    playerId,
                    cityName,
                    onlineUsedBonusToken: didUseABonusPost
                })
            }
            logicBundle.boardController.updateCityBorderColor(cityName, this.calculateControllingPlayer(city).color);

            this.resolveAction(player);
        },
        upgradeAtCity(cityName, playerId, isOnlineAction = false) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            const city = this.cityStorageObject[cityName]

            const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
            const { routeId } = routeCheckOutcome
            if (!city.unlock) {
                console.warn(`The city of ${city.cityName} doesn't have a corresponding unlock.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`The city of ${city.cityName} doesn't have a corresponding unlock.`);
                return;
            }
            if (!routeCheckOutcome) {
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction('You cannot upgrade without a completed route.');
                return;
            };
            // IMPORTANT! WE NEED TO ENSURE THAT THE BOTTOM RESOLUTION THINGS ONLY OCCUR WHEN THE UNLOCK IS VALID
            const wasUnlocked = this.performUnlock(player, city.unlock)
            if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                this.webSocketController.playerTookAction('upgradeAtCity', {
                    playerId,
                    cityName
                })
            }

            if (wasUnlocked) {
                player.bankedCircles += routeCheckOutcome.circle;
                player.bankedSquares += routeCheckOutcome.square;
                this.routeCompleted(routeId, player);
                this.resolveAction(player);
            }

        },
        performUnlock(player, unlock) {
            const noFurtherUpgrades = (unlockName) => {
                console.warn(`You can't upgrade your ${unlockName} any further.`)
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.warnInvalidAction(`You can't upgrade your ${unlockName} any further.`);
            }
            switch (unlock) {
                case 'purse':
                    if (player.unlockArrayIndex.purse === unlockPurseToValue.length - 1) {
                        noFurtherUpgrades('resupply capacity');
                        return false;
                    }
                    player.unlockArrayIndex.purse++;
                    player.purse = unlockPurseToValue[player.unlockArrayIndex.purse];
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their resupply. They now have ${player.purse}.`, player)
                    logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.purse, unlock)
                    break;
                case 'actions':
                    {
                        if (player.unlockArrayIndex.actions === unlockActionsToValue.length - 1) {
                            noFurtherUpgrades('actions');
                            return false;
                        }
                        player.unlockArrayIndex.actions++;
                        player.maxActions = unlockActionsToValue[player.unlockArrayIndex.actions];
                        // We only give the player a free action when they are actually advancing the total
                        // i.e. not going from 3 -> 3 at index 1 ->2
                        let actionUpgradeText = `$PLAYER1_NAME has upgraded their actions per turn. They now have ${player.maxActions}.`
                        if ([1, 3, 5].includes(player.unlockArrayIndex.actions)) {
                            player.currentActions++;
                            actionUpgradeText += ' They get a free action as a result'
                            logicBundle.turnTrackerController.updateTurnTracker(player)
                        }
                        logicBundle.logController.addTextToGameLog(actionUpgradeText, player);
                        logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.actions, unlock)
                        break;
                    }
                case 'colors':
                    if (player.unlockArrayIndex.colors === unlockColorsToValue.length - 1) {
                        noFurtherUpgrades('available colors');
                        return false;
                    }
                    player.unlockArrayIndex.colors++;
                    player.unlockedColors.push(unlockColorsToValue[player.unlockArrayIndex.colors]);
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their available colors. They can now place pieces on ${player.unlockedColors.slice(-1)}.`, player)
                    logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.colors, unlock)
                    break;
                case 'maxMovement':
                    if (player.unlockArrayIndex.maxMovement === unlockMovementToValue.length - 1) {
                        noFurtherUpgrades('pieces moved per action');
                        return false;
                    }
                    player.unlockArrayIndex.maxMovement++;
                    player.maxMovement = unlockMovementToValue[player.unlockArrayIndex.maxMovement];
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their maximum movement. They now have ${player.maxMovement}.`, player)
                    logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.maxMovement, unlock)
                    break;
                case 'keys':
                    if (player.unlockArrayIndex.keys === unlockKeysToValue.length - 1) {
                        noFurtherUpgrades('route multiplier');
                        return false;
                    }
                    player.unlockArrayIndex.keys++;
                    player.keys = unlockKeysToValue[player.unlockArrayIndex.keys];
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their route multiplier. They now have ${player.keys}.`, player)
                    logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.keys, unlock)
                    break;
                default:
                    console.error('we should not hit the default')
                    return false
            }


            // Adding the free pieces into supply
            if (unlock === 'maxMovement') {
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has unlocked a circle for their supply.`, player);
                player.supplyCircles++;
            } else {
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has unlocked a square for their supply.`, player)
                player.supplySquares++
            }
            logicBundle.playerDeskAndInformationController.componentBuilders.updateSupplyAndBank(player);
            // lets us know that an upgrade was validated and occurred
            return true
        },
        checkIfPlayerControlsARoute(playerId, cityName) {
            // at some point return BOTH routes
            for (const routeId in this.routeStorageObject) {
                if (this.routeStorageObject[routeId].cities.includes(cityName)) {
                    let isComplete = true;
                    let square = 0;
                    let circle = 0;
                    for (const nodeId in this.routeStorageObject[routeId].routeNodes) {
                        const node = this.routeStorageObject[routeId].routeNodes[nodeId]
                        if (node.playerId === playerId) {
                            if (node.shape === 'square') {
                                square++
                            } else if (node.shape === 'circle') {
                                circle++;
                            }
                        } else {
                            isComplete = false;
                            break; // don't return, need to check the other routes
                        }
                    }
                    if (isComplete) {
                        return {
                            routeId,
                            square,
                            circle,
                        }
                    }
                }
            }
            return false;
        },
        calculateControllingPlayer(city) {
            if (city.occupants.length === 0) {
                return false
            }
            const controlObj = {}
            this.playerArray.forEach(player => {
                controlObj[player.id] = 0;
            })
            city.occupants.forEach(occupantId => {
                controlObj[occupantId]++;
            })

            // TODO
            // may need to test this
            if (city.bonusSpotOccupantArray.length > 0) {
                city.bonusSpotOccupantArray.forEach(bonusIdArr => {
                    controlObj[bonusIdArr[0]]++
                })
            }

            const maxPieces = Math.max(...Object.values(controlObj));
            const winnerArray = []
            for (let key in controlObj) {
                if (controlObj[key] === maxPieces) {
                    winnerArray.push(key)
                }
            }
            for (let i = city.occupants.length - 1; i >= 0; i--) {
                if (winnerArray.includes(city.occupants[i])) {
                    return this.getPlayerById(city.occupants[i]);
                }
            }
            console.error('We should never reach here')

        },
        checkEastWestRouteByPlayerId(playerId) {
            // logicBundle.gameController.checkEastWestRouteByPlayerId(logicBundle.gameController.playerArray[0].id)
            if (!this.checkIfPlayerIsPresentInCity(playerId, 'Arnheim') ||
                !this.checkIfPlayerIsPresentInCity(playerId, 'Stendal')) {
                return false;
            }
            const citiesToCheck = ['Arnheim']
            const citiesAlreadyChecked = []
            let searchCounter = 0;
            while (citiesToCheck.length > 0) {
                const currentCityName = citiesToCheck.pop()
                const currentlyCheckedCity = this.cityStorageObject[currentCityName];
                console.warn(`At ${currentCityName}, citiesToCheck = ${citiesToCheck} and citiesAlreadyChecked = ${citiesAlreadyChecked}`)
                // Need to end at Stendal
                if (currentCityName === 'Stendal') {
                    console.log('We hit stendal at searchCounter =', searchCounter)
                    return true
                }
                if (this.checkIfPlayerIsPresentInCity(playerId, currentCityName)) {
                    currentlyCheckedCity.neighboringCities.forEach(neighborCityName => {
                        if (!citiesAlreadyChecked.includes(neighborCityName) && !citiesToCheck.includes(neighborCityName)) {
                            citiesToCheck.push(neighborCityName)
                        }
                    })
                }
                citiesAlreadyChecked.push(currentCityName)

                // This is a fail safe against infinite loops
                if (searchCounter > 35) {
                    console.error('Hit searchCounter BFS limit, breaking')
                    break;
                }
                searchCounter++;
            }
            console.warn('False at searchCounter = ', searchCounter)
            return false;
        },
        checkIfPlayerIsPresentInCity(playerId, cityName) {
            const city = this.cityStorageObject[cityName]
            for (const occupant of city.occupants) {
                if (playerId === occupant) {
                    return true
                }
            }
            return false
        },
        eastWestRouteCompleted(player) {
            // logicBundle.gameController.eastWestRouteCompleted(logicBundle.gameController.playerArray[0])

            if (player.hasCompletedEastWestRoute) {
                console.error(`${player.name} has already completed an East-West route`)
                return;
            }
            const claimedRoutes = Object.keys(this.eastWestStorageObject).length;
            if (claimedRoutes === 3) {
                // Maybe this shouldn't be an error? - I guess the idea is we should even do the network in the
                // city capture function in this case.
                console.error('East West route already full.')
                return;
            }
            const highestAvailablePoints = EAST_WEST_POINTS[claimedRoutes]

            this.eastWestStorageObject[highestAvailablePoints] = player.color
            player.hasCompletedEastWestRoute = true;

            this.scorePoints(highestAvailablePoints, player)
            logicBundle.boardController.addPieceToEastWestPoints(highestAvailablePoints, player.color)

            const pointScoreText = '$PLAYER1_NAME has completed an East-West route.'
            logicBundle.logController.addTextToGameLog(pointScoreText, player)
        },
        routeCompleted(routeId, player) {
            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has completed route ${routeId}`, player)
            const route = this.routeStorageObject[routeId]
            // ______________
            if (route.token) {
                const tokenKind = route.token
                this.tokensCapturedThisTurn.push(tokenKind);
                logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has claimed a ${tokenKind} token.`, player)
                player.currentTokens.push(tokenKind);
                logicBundle.playerDeskAndInformationController.componentBuilders.updateTokensInSupplyAndBank(player)
                logicBundle.playerDeskAndInformationController.componentBuilders.updateTokenTracker(player, this.tokensCapturedThisTurn.length)
                // Clear after adding the token otherwise we lose the reference
                logicBundle.boardController.clearTokenFromRouteAndHide(routeId)
                this.routeStorageObject[routeId].token = false;
            }
            // ________
            route.cities.forEach(cityId => {
                const controller = this.calculateControllingPlayer(this.cityStorageObject[cityId])
                if (controller) {
                    this.scorePoints(1, controller);
                }
            })
            for (const nodeToClearId in this.routeStorageObject[routeId].routeNodes) {
                this.routeStorageObject[routeId].routeNodes[nodeToClearId] = {
                    nodeId: nodeToClearId,
                    occupied: false,
                    shape: undefined,
                    color: undefined,
                    playerId: undefined,
                };
                logicBundle.boardController.clearPieceFromRouteNode(nodeToClearId)
            }

        },
        scorePoints(pointValue, player) {
            const pointScoreText = `$PLAYER1_NAME scored ${pluralifyText('point', pointValue)}!`
            logicBundle.logController.addTextToGameLog(pointScoreText, player)
            player.currentPoints += pointValue;
            logicBundle.boardController.updatePoints(player.currentPoints, player.color)
            if (player.currentPoints >= 20) {
                // We don't end the game until the action has been completed
                this.shouldEndGame = true;
            }
        },
        handleTokenMenuRequest(playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;
            if (player.currentTokens.length === 0) {
                console.warn('You don\'t have any tokens to use.')
                logicBundle.inputHandlers.warnInvalidAction('You don\'t have any tokens to use.')
                return
            }
            logicBundle.inputHandlers.populateTokenMenu(player.currentTokens)
        },
        useToken(tokenType, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;
            switch (tokenType) {
                case 'threeActions':
                    this.tokenActions.gainActions(playerId, 3)
                    break;
                case 'fourActions':
                    this.tokenActions.gainActions(playerId, 4)
                    break;
                case 'freeUpgrade':
                    this.tokenActions.freeUpgradeSetup(player)
                    break;
                case 'switchPost':
                    this.tokenActions.switchPost(player)
                    break;
                case 'moveThree':
                    this.tokenActions.moveThree(player)
                    break;
                case 'bonusPost':
                    this.tokenActions.bonusPost(player)
                    break;
                default:
                    console.error(`Unknown Token Type: ${tokenType}`)
            }
        },
        finishTokenUsage(player, tokenType) {
            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME used a ${TOKEN_READABLE_NAMES[tokenType]} token.`, player)
            logicBundle.inputHandlers.clearAllActionSelection()
            const indexOfToken = player.currentTokens.indexOf(tokenType)
            player.currentTokens.splice(indexOfToken, 1);
            player.usedTokens.push(tokenType)
            // need to clear the token information
            gameController.tokenUsageInformation = {};
            logicBundle.playerDeskAndInformationController.componentBuilders.updateTokensInSupplyAndBank(player)
        },
        tokenActions: {
            gainActions(playerId, actionsNumber, isOnlineAction = false) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }

                console.warn(`${player.name} is gaining ${actionsNumber} actions`)
                player.currentActions += actionsNumber;
                logicBundle.turnTrackerController.updateTurnTracker(player)
                gameController.finishTokenUsage(player, actionsNumber === 3 ? 'threeActions' : 'fourActions')
                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    gameController.webSocketController.playerTookAction('gainActions', {
                        playerId,
                        actionsNumber,
                    })
                }
            },
            freeUpgradeSetup(player) {
                const availableUpgrades = [];
                for (let unlockKey in player.unlockArrayIndex) {
                    if (player.unlockArrayIndex[unlockKey] < unlockMapMaxValues[unlockKey] - 1) {
                        availableUpgrades.push(unlockKey)
                    }
                }
                if (availableUpgrades.length === 0) {
                    logicBundle.inputHandlers.clearAllActionSelection()
                    console.warn('You\'ve already maxed out all upgrades. Well done!')
                    logicBundle.inputHandlers.warnInvalidAction('You\'ve already maxed out all upgrades. Well done!')
                    return
                }
                logicBundle.inputHandlers.populateUpgradeMenuFromToken(availableUpgrades);

            },
            useFreeUpgrade(upgradeType, playerId, isOnlineAction = false) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;
                gameController.performUnlock(player, upgradeType)
                gameController.finishTokenUsage(player, 'freeUpgrade')
                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    gameController.webSocketController.playerTookAction('useFreeUpgrade', {
                        playerId,
                        upgradeType,
                    })
                }
            },
            switchPost() {
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.selectedAction = 'switchPostSelection';
                logicBundle.inputHandlers.updateActionInfoText('Select two spots in the same city to exchange. You must own one of them.');
            },
            selectedPostToSwitch(cityId, citySpotNumber, playerId,
                optionalTokenUsageInformation = false, isOnlineAction = false) {

                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }

                if (optionalTokenUsageInformation) {
                    console.log('Overwriting with')
                    console.log(optionalTokenUsageInformation)
                    gameController.tokenUsageInformation = optionalTokenUsageInformation;
                }

                playerId = player.id;
                console.log(cityId, citySpotNumber)
                // TODO check that the spot is not a bonus spot!
                // 1. Check that this spot is occupied, if not warn and return
                const city = gameController.cityStorageObject[cityId];
                if (city.occupants[citySpotNumber] === undefined) {
                    console.warn('That spot is unoccupied.')
                    logicBundle.inputHandlers.warnInvalidAction('That spot is unoccupied.')
                    return;
                }
                // 1. check that the player owns at least one spot and at least one other player has another spot
                // Bonus spots are *NOT* usable for switching
                let playerOwns = false;
                let rivalOwns = false;
                city.occupants.forEach(occupantId => {
                    if (occupantId === player.id) {
                        playerOwns = true;
                    } else {
                        rivalOwns = true;
                    }
                })
                if (!(playerOwns && rivalOwns)) {
                    console.warn(`The city of ${cityId} needs to have a post owned by you and a post owned by a rival to switch.`)
                    logicBundle.inputHandlers.warnInvalidAction(`The city of ${cityId} needs to have a post owned by you and a post owned by a rival to switch.`)
                    return;
                }
                // 2. check if there is a previous spot in the gameController.tokenUsageInformation object
                // 3. If there isn't it's pretty easy. We add it to the object and update the UI (no overwrite)

                if (!gameController.tokenUsageInformation.switchSpot) {
                    console.log('Storing the first spot')
                    gameController.tokenUsageInformation.switchSpot = [cityId, citySpotNumber];
                    logicBundle.inputHandlers.updateActionInfoText(`\nYou selected post number ${citySpotNumber} in ${cityId}. Select one more spot in ${cityId} to exchange posts.`, false)
                    return;
                }

                // -------------------------------------- Second spot
                const previousCityId = gameController.tokenUsageInformation.switchSpot[0]
                const previousSpotNumber = gameController.tokenUsageInformation.switchSpot[1]

                // 1. Check that it's the same city
                // 2. Check that one is you and the other is a different player
                if (cityId !== previousCityId) {
                    console.warn('Both trading posts need to be in the same city.')
                    logicBundle.inputHandlers.warnInvalidAction('Both trading posts need to be in the same city.')
                    return;
                }

                const occupantOne = gameController.cityStorageObject[previousCityId].occupants[previousSpotNumber]
                const occupantTwo = gameController.cityStorageObject[cityId].occupants[citySpotNumber];
                const haveDifferentOwners = occupantOne !== occupantTwo;
                const oneIsOwnedByPlayer = (occupantOne === playerId) || (occupantTwo === playerId);

                if (!(haveDifferentOwners && oneIsOwnedByPlayer)) {
                    console.warn('Both trading posts must be owned by different players, one of whom is you.')
                    logicBundle.inputHandlers.warnInvalidAction('Both trading posts must be owned by different players, one of whom is you.')
                    return;
                }

                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    console.log(cityId, citySpotNumber, playerId)
                    gameController.webSocketController.playerTookAction('selectedPostToSwitch', {
                        playerId,
                        cityId,
                        citySpotNumber,
                        tokenUsageInformation: gameController.tokenUsageInformation,
                    })
                }

                // 1. Need to switch the colors on the board pieces, 
                logicBundle.boardController.switchPieceColor(`piece-${previousCityId}-${previousSpotNumber}`, `piece-${cityId}-${citySpotNumber}`)
                // 2. Need to switch the locations in cityStorage
                gameController.cityStorageObject[previousCityId].occupants[previousSpotNumber] = occupantTwo;
                gameController.cityStorageObject[cityId].occupants[citySpotNumber] = occupantOne;
                // It's possible that the city controlling player may have changed
                logicBundle.boardController.updateCityBorderColor(cityId, gameController.calculateControllingPlayer(city).color)

                // 3. Call the token used function
                gameController.finishTokenUsage(player, 'switchPost')
                // I will really need a cancel button to prevent a soft lock
                // Also need to block out the buttons in that case.
            },
            bonusPost() {
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.selectedAction = 'capture';
                gameController.tokenUsageInformation.tokenAction = 'bonusPost';
                logicBundle.inputHandlers.updateActionInfoText('Select a city to capture. You will receive a bonus trading post.');
            },
            moveThree() {
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.selectedAction = 'tokenMove';
                logicBundle.inputHandlers.additionalInfo = 'selectPiece'

                logicBundle.inputHandlers.toggleInputButtons(true)
                logicBundle.inputHandlers.updateActionInfoText('Select an opposing piece and a location to move it to. You can do this up to three times');
                logicBundle.inputHandlers.populateMoveThreeMenu(3)
                gameController.tokenUsageInformation.movesLeft = 3;
            },
            selectMoveThreePiece(nodeId, playerId) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;
                // 1. Get a reference to the node itself
                const routeId = getRouteIdFromNodeId(nodeId);
                const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]
                // 1. Validate that the location is occupied and owned by an opponent - warn and return if not
                if (!node.occupied || node.playerId === playerId) {
                    console.warn('You must select a node occupied by an opposing piece.')
                    logicBundle.inputHandlers.warnInvalidAction(' You must select a node occupied by an opposing piece.')
                    return;
                }
                // 2. If we're on happy path, we need to store the location in the token info
                gameController.tokenUsageInformation.originLocation = nodeId;
                // 3. We need to update the action info UI
                logicBundle.inputHandlers.updateActionInfoText(`You selected the piece at ${nodeId}. Select an empty spot to move it to.`)
                // 4. We need to change the additionalInfo field
                logicBundle.inputHandlers.additionalInfo = 'selectLocation'
            },
            selectMoveThreeLocation(nodeId, playerId,
                optionalTokenUsageInformation = false, isOnlineAction = false) {

                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;

                if (optionalTokenUsageInformation) {
                    gameController.tokenUsageInformation = optionalTokenUsageInformation;
                }


                console.log('selectMoveThreeLocation', nodeId)
                // 1. First get the reference to the node
                const routeId = getRouteIdFromNodeId(nodeId);
                const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]

                // 2. Verify that the node is empty- if not warn and return
                if (node.occupied) {
                    console.warn('That node is already occupied.')
                    logicBundle.inputHandlers.warnInvalidAction('That node is already occupied.');
                    return;
                }

                // 5. Store the owning player and the shape
                const originId = gameController.tokenUsageInformation.originLocation
                const routeOriginId = getRouteIdFromNodeId(originId);
                const originNode = gameController.routeStorageObject[routeOriginId].routeNodes[originId]
                const originPlayer = gameController.getPlayerById(originNode.playerId);
                const originShape = originNode.shape;

                // 6. Clear the piece from city storage
                const clearedProps = {
                    occupied: false,
                    shape: undefined,
                    color: undefined,
                    playerId: undefined,
                };
                Object.assign(originNode, clearedProps);
                // 7. clear the piece from the board
                logicBundle.boardController.clearPieceFromRouteNode(originId)

                // 8. Place piece in the new location in cityStorage
                // 9. Place piece on the new location on boardUI
                gameController.placePieceOnNode(nodeId, originShape, originPlayer)

                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    // TODO - I don't know if the spread operator copying is necessary, I think I
                    // was misdiagnosing a bug
                    const tokenUsageInformation = { ...gameController.tokenUsageInformation }
                    gameController.webSocketController.playerTookAction('selectMoveThreeLocation', {
                        playerId,
                        nodeId,
                        tokenUsageInformation,
                    });
                }

                // 10. Decrement the gameController.tokenUsageInformation.movesLeft - if
                // it's zero we call this.endMoveThree
                gameController.tokenUsageInformation.movesLeft--;
                if (gameController.tokenUsageInformation.movesLeft === 0 && !isOnlineAction) {
                    this.endMoveThree();
                    return;
                }
                // 11. Otherwise we update the tokenUI and actionInfo UI texts
                // 12. Then change the logicBundle.inputHandlers.additionalInfo back to 'selectPiece'
                const movesLeft = gameController.tokenUsageInformation.movesLeft
                if (!isOnlineAction) {
                    logicBundle.inputHandlers.updateActionInfoText('Select an opposing piece and a location to move it to. You can do this up to three times');
                    logicBundle.inputHandlers.populateMoveThreeMenu(movesLeft)
                } else {
                    logicBundle.inputHandlers.updateActionInfoText(
                        `Waiting on ${player.name}'s Move Three Tradesmen Token. They have ${pluralifyText('move', movesLeft)} left.`);
                }

                logicBundle.inputHandlers.additionalInfo = 'selectPiece';
                gameController.tokenUsageInformation.originLocation = undefined;
            },
            endMoveThree(playerId, isOnlineAction = false) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;
                // 1. Reset logicBundle.inputHandlers. I think this should clear the token area and re-enable the action buttons
                if (gameController.shouldEnableInputButtons()) {
                    logicBundle.inputHandlers.toggleInputButtons(false)
                }
                logicBundle.inputHandlers.clearAllActionSelection()
                // 2. Trigger the finishTokenUsage method

                if (!logicBundle.sessionInfo.isHotseatMode && !isOnlineAction) {
                    gameController.webSocketController.playerTookAction('endMoveThree', {
                        playerId,
                    });
                }
                gameController.finishTokenUsage(player, 'moveThree');
            }
        },
        endGame() {
            // I'm 90% sure that this is a feature that should be pretty much equivalent on hotseat and online
            // It might be worth building a pre-filled map for testing - would be similar to save/load logic
            /*

                6. network - this will be the hardest by far. Need to find each network and see which one is largest.
                Then sum all the trading posts in the network then multiply by the key value
            */

            this.playerArray.forEach(player => {
                const playerPointObject = this.calculateTotalScore(player)
                player.playerPointObject = playerPointObject;
                console.warn(this.calculateTotalScore(player))
            })

            const { winnerArray, victoryType } = this.determineWinner()
            // TODO - log the winner, handle online room closing (maybe we just send a a message to the server for 
            // the time being?)
            document.body.append(createScoreModal(this.playerArray, winnerArray, victoryType))
        },
        determineWinner() {
            // NOTE THAT NETWORK SCORE DOESN'T EXIST YET - thus I can't thoroughly test the tiebreakers
            // (except by providing my own data)
            /*
                The player who now has the most prestige points wins the game.
                If there is a tie, the tied player who has developed their Actions
                ability the least wins. If there is still a tie, the player who scored
                the most points for their network wins. If there is still a tie, the
                tied players share the victory
            */
            let maxScore = 0;
            this.playerArray.forEach(player => {
                if (player.playerPointObject.totalPoints > maxScore) {
                    maxScore = player.playerPointObject.totalPoints;
                }
            })
            let winnerArray = this.playerArray.filter(player => maxScore === player.playerPointObject.totalPoints);
            if (winnerArray.length === 1) {
                return { winnerArray, victoryType: null };
            }
            // ------- tie breaker least number of action unlocks
            let minActions = Number.POSITIVE_INFINITY;
            winnerArray.forEach(player => {
                if (player.unlockArrayIndex.actions < minActions) {
                    minActions = player.unlockArrayIndex.actions;
                }
            })
            winnerArray = winnerArray.filter(player => player.unlockArrayIndex.actions === minActions);
            if (winnerArray.length === 1) {
                return { winnerArray, victoryType: 'lowest actions unlocked' }
            }
            // ------- tie breaker network score
            let maxNetworkScore = 0;
            winnerArray.forEach(player => {
                if (player.playerPointObject.networkPoints > maxNetworkScore) {
                    maxNetworkScore = player.playerPointObject.networkPoints;
                }
            })
            winnerArray = winnerArray.filter(player => player.playerPointObject.networkPoints === maxNetworkScore);
            if (winnerArray.length === 1) {
                return { winnerArray, victoryType: 'most network points' }
            }
            if (winnerArray.length === 0) {
                console.error('Error: Unable to determine winner.')
            }
            return { winnerArray, victoryType: 'multipleWinners' }

        },
        calculateTotalScore(player) {
            let prestigePoints = 0;
            let tokenPoints = 0;
            let abilityPoints = 0;
            let coellenPoints = 0;
            let controlledCityPoints = 0;
            let networkPoints = 0;

            prestigePoints = player.currentPoints

            const collectedTokens = player.currentTokens.length + player.usedTokens.length;
            switch (true) {
                case collectedTokens === 0:
                    tokenPoints = 0;
                    break;
                case collectedTokens === 1:
                    tokenPoints = 1;
                    break;
                case collectedTokens <= 3:
                    tokenPoints = 3;
                    break;
                case collectedTokens <= 5:
                    tokenPoints = 6;
                    break;
                case collectedTokens <= 7:
                    tokenPoints = 10;
                    break;
                case collectedTokens <= 9:
                    tokenPoints = 15;
                    break;
                case collectedTokens >= 10:
                    tokenPoints = 21;
                    break;
                default:
                    console.error('collectedTokens not in expected range')
            }

            const scoredAbilities = ['actions', 'purse', 'maxMovement', 'colors']

            scoredAbilities.forEach(abilityKey => {
                if (player.unlockArrayIndex[abilityKey] === unlockMapMaxValues[abilityKey] - 1) {
                    abilityPoints += 4;
                }
            })

            for (const city of Object.values(this.cityStorageObject)) {
                const controllingPlayer = this.calculateControllingPlayer(city)
                if (controllingPlayer && controllingPlayer.id === player.id) {
                    controlledCityPoints += 2;
                }
            }

            Object.keys(this.coellenSpecialAreaObject).forEach(spotNumber => {
                const { ownerId, pointValue } = this.coellenSpecialAreaObject[spotNumber]
                if (ownerId === player.id) {
                    coellenPoints += pointValue;
                }
            })

            let mostTradingPosts = 0;
            const checkedCities = [];
            for (const [cityName, city] of Object.entries(this.cityStorageObject)) {
                if (!checkedCities.includes(cityName) && this.checkIfPlayerIsPresentInCity(player.id, cityName)) {
                    const {citiesInThisNetwork, totalTradingPosts} = this.findSubNetwork(city, player.id)
                    mostTradingPosts = Math.max(totalTradingPosts, mostTradingPosts);
                    checkedCities.push(...citiesInThisNetwork)
                    console.log(citiesInThisNetwork, totalTradingPosts)
                }
            }

            networkPoints = mostTradingPosts * player.keys;
            const playerPointObject = {
                prestigePoints,
                tokenPoints,
                abilityPoints,
                coellenPoints,
                controlledCityPoints,
                networkPoints,
                totalPoints: prestigePoints + tokenPoints + abilityPoints
                    + coellenPoints + controlledCityPoints + networkPoints,
            }
            return playerPointObject
        },
        findSubNetwork(startingCity, playerId) {
            // This methods assumes that the player is already present in the city
            // logicBundle.gameController.findSubNetwork(logicBundle.gameController.cityStorageObject['Alpha'],logicBundle.gameController.playerArray[0].id)
            if (!this.checkIfPlayerIsPresentInCity(playerId, startingCity.cityName)) {
                console.error(`${playerId} does not have a post in ${startingCity.cityName}, findSubNetwork should not have been called`);
                return
            }

            let totalTradingPosts = 0;
            const citiesInThisNetwork = []

            const citiesToCheck = [startingCity.cityName]
            const citiesAlreadyChecked = []
            // I'm worried about if I look at this city in a different route. Intuitively, I don't think this
            // should be an issue if we have a cities visited in the outer function, but something to consider
            let searchCounter = 0;
            while (citiesToCheck.length > 0) {
                const currentCityName = citiesToCheck.pop()
                const currentlyCheckedCity = this.cityStorageObject[currentCityName];
                // console.warn(`At ${currentCityName}, citiesToCheck = ${citiesToCheck} and citiesAlreadyChecked = ${citiesAlreadyChecked}`)
                if (this.checkIfPlayerIsPresentInCity(playerId, currentCityName)) {
                    currentlyCheckedCity.neighboringCities.forEach(neighborCityName => {
                        // We only add it to check if it hasn't been previously checked and we haven't already queued it
                        if (!citiesAlreadyChecked.includes(neighborCityName) && !citiesToCheck.includes(neighborCityName)) {
                            citiesToCheck.push(neighborCityName)
                        }
                    })
                    citiesInThisNetwork.push(currentCityName)
                    totalTradingPosts += this.countPlayerTradingPostsInCity(currentlyCheckedCity, playerId)
                }
                citiesAlreadyChecked.push(currentCityName)

                // This is a fail safe against infinite loops
                if (searchCounter > 35) {
                    console.error('Hit searchCounter BFS limit, breaking')
                    break;
                }
                searchCounter++;
            }
            return {
                citiesInThisNetwork,
                totalTradingPosts,
            }
        },
        countPlayerTradingPostsInCity(city, playerId) {
            let bonusTradingPosts = 0;
            city.bonusSpotOccupantArray.forEach(bonusIdArr => {
                if (bonusIdArr[0] === playerId) {
                    bonusTradingPosts++;
                }
            })
            let standardTradingPosts = 0;
            city.occupants.forEach(occupantId => {
                if (occupantId === playerId) {
                    standardTradingPosts++;
                }
            })
            return bonusTradingPosts + standardTradingPosts;
        },
        validatePlayerIsActivePlayer(playerId, activePlayer) {
            if (logicBundle.sessionInfo.isHotseatMode) {
                // Validation isn't need for hotseat mode
                return activePlayer
            }
            // TODO - maybe instead we should use isOnlineAction?
            if (!playerId && !logicBundle.sessionInfo.isHotseatMode) {
                // If no playerId has been provided by the clientWebSocketController, 
                // we assume it's coming from the client
                playerId = logicBundle.sessionInfo.participantId
            }
            if (playerId !== activePlayer.id) {
                console.warn('Player attempting to take an off-turn action')
                logicBundle.inputHandlers.warnInvalidAction('It\'s not your turn.')
                return false;
            } else {
                return activePlayer
            }
        },
        shouldEnableInputButtons() {
            return logicBundle.sessionInfo.isHotseatMode ||
                logicBundle.sessionInfo.participantId === this.getActivePlayer().id
        },
        saveGame() {
            console.warn('Saving game')
            window.localStorage.setItem('isSaved', true)
            // TODO - move these fields into a "GAME STATE" object
            window.localStorage.setItem('currentTurn', this.currentTurn)
            window.localStorage.setItem('regularTokensArray', JSON.stringify(this.regularTokensArray))
            window.localStorage.setItem('playerArray', JSON.stringify(this.playerArray))
            window.localStorage.setItem('cityStorageObject', JSON.stringify(this.cityStorageObject))
            window.localStorage.setItem('routeStorageObject', JSON.stringify(this.routeStorageObject))
            window.localStorage.setItem('coellenSpecialAreaObject', JSON.stringify(this.coellenSpecialAreaObject))
            window.localStorage.setItem('eastWestStorageObject', JSON.stringify(this.eastWestStorageObject))

        },
        loadGame() {
            this.playerArray = JSON.parse(window.localStorage.getItem('playerArray'));
            this.initializeCitiesAndState();
            this.cityStorageObject = JSON.parse(window.localStorage.getItem('cityStorageObject'));
            this.routeStorageObject = JSON.parse(window.localStorage.getItem('routeStorageObject'));
            this.coellenSpecialAreaObject = JSON.parse(window.localStorage.getItem('coellenSpecialAreaObject'));
            this.eastWestStorageObject = JSON.parse(window.localStorage.getItem('eastWestStorageObject'));

            this.regularTokensArray = JSON.parse(window.localStorage.getItem('regularTokensArray'));
            this.currentTurn = window.localStorage.getItem('currentTurn');
            // Point tracker
            this.playerArray.forEach(player => {
                logicBundle.boardController.updatePoints(player.currentPoints, player.color)
            })
            // Cities
            Object.keys(this.cityStorageObject).forEach(cityName => {
                const city = this.cityStorageObject[cityName]
                // need to do both spots and bonus spots
                city.openSpotIndex = 0;
                // looks like we make assumptions about the openSpotIndex
                city.occupants.forEach(id => {
                    logicBundle.boardController.addPieceToCity(city, this.getPlayerById(id).color)
                    city.openSpotIndex++;
                })
                city.bonusSpotOccupantArray.forEach((idAndShape, index) => {
                    logicBundle.boardController.addBonusPieceToCity(city, this.getPlayerById(idAndShape[0]).color,
                        idAndShape[1], index)
                })
                logicBundle.boardController.updateCityBorderColor(cityName, this.calculateControllingPlayer(city).color);
            })

            // Routes
            Object.keys(this.routeStorageObject).forEach(routeId => {
                // This is also where we will need to do tokens (but not in the routeNode loop)
                const route = this.routeStorageObject[routeId];
                logicBundle.boardController.clearTokenFromRouteAndHide(routeId)
                if (route.token) {
                    logicBundle.boardController.addTokenToRoute(routeId, route.token, route.tokenColor)
                }
                Object.keys(route.routeNodes).forEach(nodeId => {
                    const node = route.routeNodes[nodeId]
                    if (node.occupied) {
                        logicBundle.boardController.addPieceToRouteNode(nodeId, node.color, node.shape)
                    }
                })
            })
            // Coellen
            Object.keys(this.coellenSpecialAreaObject).forEach(spotNumber => {
                const { color } = this.coellenSpecialAreaObject[spotNumber]
                logicBundle.boardController.addPieceToCoellenSpecialArea(spotNumber, color)
            })
            // East-West
            Object.keys(this.eastWestStorageObject).forEach(pointValue => {
                logicBundle.boardController.addPieceToEastWestPoints(pointValue, this.eastWestStorageObject[pointValue])
            })
            // Turn tracker
            logicBundle.turnTrackerController.updateTurnTracker(this.getActivePlayer())
            if (logicBundle.sessionInfo.isHotseatMode) {
                logicBundle.playerDeskAndInformationController.focusOnPlayerDesk(this.getActivePlayer(), this.playerArray)
            }
            // Player board
            this.playerArray.forEach(player => {
                Object.keys(player.unlockArrayIndex).forEach(unlockKey => {
                    if (player.unlockArrayIndex[unlockKey] > 0) {
                        for (let index = 1; index <= player.unlockArrayIndex[unlockKey]; index++) {
                            logicBundle.playerDeskAndInformationController.unlockPieceFromBoard(player,
                                index, unlockKey)
                        }
                    }
                })

                logicBundle.playerDeskAndInformationController.componentBuilders.updateTokensInSupplyAndBank(player)
            })
            // Game log
            logicBundle.logController.loadHistoryIntoLogFromLocalStorage()
        }
    }

    logicBundle.gameController = gameController;
    return gameController
}
