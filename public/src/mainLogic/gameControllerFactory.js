import { logicBundle } from "../helpers/logicBundle.js";
import { Player } from "./PlayerClass.js";
import {
    FIRST_PLAYER_SQUARES, STARTING_TOKENS, REGULAR_TOKENS_NUMBER_MAP, TOKEN_CONFIG_BY_ROUTES,
    IS_HOTSEAT_MODE, TOKEN_READABLE_NAMES
} from "../helpers/constants.js";
import { getRandomArrayElementAndModify, getRouteIdFromNodeId, pluralifyText } from "../helpers/helpers.js";
import {
    unlockActionsToValue, unlockPurseToValue, unlockColorsToValue,
    unlockMovementToValue, unlockKeysToValue, unlockMapMaxValues
} from "../helpers/playerFieldsMaps.js";

export const gameControllerFactory = () => {
    const gameController = {
        initializeGameStateAndUI(playerList, boardConfig, isResuming = false) {
            console.log(playerList, boardConfig)
            // let's just use turn order for IDs
            this.playerArray = []
            for (let i = 0; i < playerList.length; i++) {
                const player = new Player(playerList[i][1], playerList[i][0], FIRST_PLAYER_SQUARES + i, i);
                this.playerArray.push(player)
            }

            logicBundle.playerBoardAndInformationController.initializePlayerInfoBoards(this.playerArray)
            logicBundle.turnTrackerController.updateTurnTracker(this.playerArray[0])
            this.currentTurn = 0;
            logicBundle.logController.initializeGameLog();
            this.routeStorageObject = {}
            this.cityStorageObject = {};
            this.moveInformation = {};
            this.bumpInformation = {};
            this.tokenPlacementInformation = {};
            this.tokenUsageInformation = {}
            this.tokensCapturedThisTurn = [];
            this.shouldEndGame = false;
            logicBundle.inputHandlers.bindInputHandlers()
            logicBundle.boardController.initializeUI(this.playerArray);

            const startingTokensArray = STARTING_TOKENS;
            const regularTokensArray = [];
            Object.keys(REGULAR_TOKENS_NUMBER_MAP).forEach(key => {
                for (let i = 0; i < REGULAR_TOKENS_NUMBER_MAP[key]; i++) {
                    regularTokensArray.push(key)
                }
            })
            this.regularTokensArray = regularTokensArray

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
                        if (TOKEN_CONFIG_BY_ROUTES[routeId][2]) {
                            tokenValue = getRandomArrayElementAndModify(startingTokensArray)
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

        },
        resumeGame() {
            //TODO - will need to store in localStorage, this will require a LOT of effort and testing
            // I guess it's possible that it won't be too bad if we're just loading gameController fields
            // It will still be a big difference between autosaving and manual saving - the former maybe we 
            // snapshot after every action? as part of resolve action?
        },
        getActivePlayer() {
            return this.playerArray[this.currentTurn % this.playerArray.length]
        },
        getPlayerById() {
            // TODO, only used for online play I think
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
            if (IS_HOTSEAT_MODE) {
                logicBundle.playerBoardAndInformationController.focusOnPlayerBoard(this.getActivePlayer(), this.playerArray)
            }
            this.saveGame();
            lastPlayer.currentActions = lastPlayer.maxActions;
        },
        replaceTokens(player) {
            // 2. "Shuffle and Deal" the token stack
            // TODO, check for the regularTokensArray to be empty. Technically the game should end 
            // after the ACTION not the TURN in this case (when the physical piece would be put on the
            // "eat stack"), but this works for the moment
            if (this.regularTokensArray.length === 0) {
                this.endGame()
                return;
            }
            const currentReplacement = getRandomArrayElementAndModify(this.regularTokensArray)
            this.tokenPlacementInformation.currentReplacement = currentReplacement;
            const tokensToPlace = this.tokenPlacementInformation.tokensToPlace

            // 3. Update both turn tracker and the action info area with the piece that is going to be replaces
            logicBundle.turnTrackerController.updateTurnTrackerWithTokenInfo(player, currentReplacement, tokensToPlace)
            logicBundle.inputHandlers.setUpTokenActionInfo(currentReplacement);
            // The above method sets the actionInfo type to placeNewToken
            // 4. Un-hide all the token locations on the map (may need to switch from display to visible)
            logicBundle.boardController.toggleAllTokenLocations(Object.keys(this.routeStorageObject), 'visible')
            // 5. Set the selectedAction type to something like 'replacingToken'
            // 6. disable all the action buttons
            // 7. add all the tokensCapturedThisTurn to the player's bank and clear the field

            // 35. Need to call advanceTurn(lastPlayer) to actually end the turn (probably after
            // the final replaceTokenAtLocation)
        },
        replaceTokenAtLocation(routeId, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;
            // this should be triggered by clicking on a token holder when the input selectedAction is correct
            // 1. Verification
            // 2. Check that token is not already there - If it is we return and warn
            if (this.routeStorageObject[routeId].token) {
                console.warn('That location already has a token.');
                logicBundle.inputHandlers.warnInvalidAction('That location already has a token.')
                return;
            }
            // 3. Check that the route is completely empty
            // TODO consider breaking this logic out into a method if it's used anywhere else (it's
            // *NOT* the same thing as occurs in checking bump locations)
            for (let nodeId in this.routeStorageObject[routeId].routeNodes) {
                if (this.routeStorageObject[routeId].routeNodes[nodeId].occupied) {
                    console.warn('Route must be unoccupied.')
                    logicBundle.inputHandlers.warnInvalidAction('Route must be unoccupied.');
                    return;
                }
            }
            // 4. Check that at least one city endpoint has an empty spot
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
            // 6. If the location is valid we need to add to the board.
            logicBundle.boardController.addTokenToRoute(routeId, this.tokenPlacementInformation.currentReplacement)
            // 7. We also need to update the route storage object
            this.routeStorageObject[routeId].token = this.tokenPlacementInformation.currentReplacement;
            // 8. We then need to lower the this.tokenPlacementInformation.tokensToPlace
            this.tokenPlacementInformation.tokensToPlace--;
            // 8. Also about the playerBoard token "eat" plate gets decremented
            logicBundle.playerBoardAndInformationController.componentBuilders.updateTokenTracker(player,
                this.tokenPlacementInformation.tokensToPlace);
            // 8. Should game log that a new token was placed
            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME placed a ${this.tokenPlacementInformation.currentReplacement}
            token at ${routeId}.`, player);
            // 9. This is where we check the tokensToPlace and have different behavior
            // ----------------Continuing (tokensToPlace > 0)-----------------
            // 10. If we keep going we probably call replaceTokens again
            // 11. Do not hide any token location
            // 12. I believe that the decrementing should be taken care of in the preceding steps
            // 13. We keep the selectedAction the same.
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
                logicBundle.inputHandlers.toggleInputButtons(false)
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
            logicBundle.inputHandlers.toggleInputButtons(false)
            player.currentActions -= 1;
            if (player.currentActions === 0) {
                this.advanceTurn(player);
                return // REMOVE THIS LINE, THIS BREAKS STUFF TODO
                // may need to refactor this in the future
            }
            logicBundle.turnTrackerController.updateTurnTracker(this.getActivePlayer())
            this.playerArray.forEach(player => {
                logicBundle.playerBoardAndInformationController.componentBuilders.updateSupplyAndBank(player)
            })
            if (this.shouldEndGame) {
                this.endGame()
            }
        },
        placeWorkerOnNodeAction(nodeId, shape, playerId) {
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
        movePieceToLocation(nodeId, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;
            const routeId = getRouteIdFromNodeId(nodeId)
            const targetNode = gameController.routeStorageObject[routeId].routeNodes[nodeId]

            const originNode = gameController.moveInformation.originNode;
            const shape = originNode.shape
            if (targetNode.occupied) {
                console.warn('This route node is already occupied.')
                logicBundle.inputHandlers.warnInvalidAction('This route node is already occupied.');
                return;
            }
            this.placePieceOnNode(nodeId, shape, player);

            logicBundle.logController.addTextToGameLog(
                `$PLAYER1_NAME moved a ${shape} from ${originNode.nodeId} to ${nodeId}`, player)
            const clearedProps = {
                occupied: false,
                shape: undefined,
                color: undefined,
                playerId: undefined,
            };
            Object.assign(originNode, clearedProps);
            logicBundle.boardController.clearPieceFromRouteNode(originNode.nodeId)
            gameController.moveInformation.movesUsed++;
            if (gameController.moveInformation.movesUsed === player.maxMovement) {
                console.warn('used up all move actions')
                this.endMoveAction(playerId)
                return;
            }
            logicBundle.inputHandlers.updateActionInfoText(
                `Select one of your own pieces to move. You have ${player.maxMovement - gameController.moveInformation.movesUsed} left.`)
            logicBundle.inputHandlers.additionalInfo = 'selectPieceToMove';
        },
        endMoveAction(playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;
            logicBundle.inputHandlers.toggleInputButtons(false)
            // The player never actually took an action, works for zero or undefined
            if (!gameController.moveInformation.movesUsed) {
                logicBundle.inputHandlers.clearAllActionSelection()
                return;
            } else {
                logicBundle.logController.addTextToGameLog(
                    `$PLAYER1_NAME moved ${this.moveInformation.movesUsed} pieces.`, player)
                this.resolveAction(player)
            }
        },
        resupply(playerId) {
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
            this.resolveAction(player)
            // eventually should chose circles vs squares, right now default to all circles, then square
        },
        bumpPieceFromNode(nodeId, shape, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            // 1. First verify that another player controls this location - if not warn and return
            const routeId = getRouteIdFromNodeId(nodeId)
            const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]
            console.log(node)
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
            this.bumpInformation.bumpedPlayer = this.playerArray[bumpedPlayerId];
            this.bumpInformation.freePiece = true;
            this.bumpInformation.circlesToPlace = circlesToPlace;
            this.bumpInformation.squaresToPlace = squaresToPlace;

            // 8. Then we place the active player piece and update the nodeStorage object
            this.placePieceOnNode(nodeId, shape, player);

            // 9. Then we update the active player info area to make it clear that we're in a weird half-turn
            // We already have turnTrackerAdditionalInformation
            logicBundle.turnTrackerController.updateTurnTrackerWithBumpInfo({
                bumpingPlayer: player,
                bumpedPlayer: this.playerArray[bumpedPlayerId],
                circlesToPlace,
                squaresToPlace
            })
            // 12. Then update inputHandler.selectedAction
            logicBundle.inputHandlers.clearAllActionSelection();
            logicBundle.inputHandlers.selectedAction = 'placeBumpedPiece';

            logicBundle.inputHandlers.setUpBumpActionInfo(nodeId, bumpedShape, squaresToPlace, circlesToPlace);
        },
        placeBumpedPieceOnNode(nodeId, shape, playerId) {
            console.log('trying to place bumped piece')
            const player = this.validatePlayerIsActivePlayer(playerId, this.bumpInformation.bumpedPlayer)
            if (!player){
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
            logicBundle.inputHandlers.setUpBumpActionInfo(nodeId, this.bumpInformation.bumpedShape,
                this.bumpInformation.squaresToPlace, this.bumpInformation.circlesToPlace);
            logicBundle.turnTrackerController.updateTurnTrackerWithBumpInfo({
                bumpingPlayer: this.bumpInformation.bumpingPlayer,
                bumpedPlayer: player,
                circlesToPlace: this.bumpInformation.circlesToPlace,
                squaresToPlace: this.bumpInformation.squaresToPlace,
            })
            // 11. We also should update the player area to show their current bank and supply
            logicBundle.playerBoardAndInformationController.componentBuilders.updateSupplyAndBank(player)
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
                if (failSafe > 15) {
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
        captureCity(cityName, playerId) {
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

            if (this.tokenUsageInformation.tokenAction === 'bonusPost') {
                console.warn(`Trying to capture ${cityName} with an additional post`)
                let usedShape;
                if (player.bankedSquares > 0) {
                    usedShape = 'square';
                    player.bankedSquares--;
                } else {
                    usedShape = 'circle';
                    player.bankedCircles--;
                }
                logicBundle.boardController.addBonusPieceToCity(cityName, player.color, usedShape, city.bonusSpotOccupantArray.length + 1)
                gameController.cityStorageObject[cityName].bonusSpotOccupantArray.push(playerId)

                gameController.finishTokenUsage(player, 'bonusPost')
            }

            logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME captured the city of ${cityName}.`, player);
            this.resolveAction(player);
        },
        upgradeAtCity(cityName, playerId) {
            const player = this.validatePlayerIsActivePlayer(playerId, this.getActivePlayer());
            if (!player) {
                return
            }
            playerId = player.id;

            const city = this.cityStorageObject[cityName]

            const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
            const { routeId } = routeCheckOutcome
            console.log(city)
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
                    logicBundle.playerBoardAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.purse, unlock)
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
                        logicBundle.playerBoardAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.actions, unlock)
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
                    logicBundle.playerBoardAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.colors, unlock)
                    break;
                case 'maxMovement':
                    if (player.unlockArrayIndex.maxMovement === unlockMovementToValue.length - 1) {
                        noFurtherUpgrades('pieces moved per action');
                        return false;
                    }
                    player.unlockArrayIndex.maxMovement++;
                    player.maxMovement = unlockMovementToValue[player.unlockArrayIndex.maxMovement];
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their maximum movement. They now have ${player.maxMovement}.`, player)
                    logicBundle.playerBoardAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.maxMovement, unlock)
                    break;
                case 'keys':
                    if (player.unlockArrayIndex.keys === unlockKeysToValue.length - 1) {
                        noFurtherUpgrades('route multiplier');
                        return false;
                    }
                    player.unlockArrayIndex.keys++;
                    player.keys = unlockKeysToValue[player.unlockArrayIndex.keys];
                    logicBundle.logController.addTextToGameLog(`$PLAYER1_NAME has upgraded their route multiplier. They now have ${player.keys}.`, player)
                    logicBundle.playerBoardAndInformationController.unlockPieceFromBoard(player, player.unlockArrayIndex.keys, unlock)
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
            // let's us know that an upgrade was validated and occurred
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
                city.bonusSpotOccupantArray.forEach(bonusId => {
                    controlObj[bonusId]++
                })
            }

            const maxPieces = Math.max(...Object.values(controlObj));
            const winnerArray = []
            for (let key in controlObj) {
                if (controlObj[key] === maxPieces) {
                    winnerArray.push(parseInt(key, 10))
                }
            }
            for (let i = city.occupants.length - 1; i >= 0; i--) {
                if (winnerArray.includes(city.occupants[i])) {
                    return this.playerArray[city.occupants[i]]
                }
            }
            console.error('We should never reach here')

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
                logicBundle.playerBoardAndInformationController.componentBuilders.updateTokensInSupplyAndBank(player)
                logicBundle.playerBoardAndInformationController.componentBuilders.updateTokenTracker(player, this.tokensCapturedThisTurn.length)
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
                    this.tokenActions.gainActions(player, 3)
                    break;
                case 'fourActions':
                    this.tokenActions.gainActions(player, 4)
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
            logicBundle.playerBoardAndInformationController.componentBuilders.updateTokensInSupplyAndBank(player)

        },
        tokenActions: {
            gainActions(player, actionsNumber) {
                console.warn(`${player.name} is gaining ${actionsNumber} actions`)
                player.currentActions += actionsNumber;
                logicBundle.turnTrackerController.updateTurnTracker(player)
                gameController.finishTokenUsage(player, actionsNumber === 3 ? 'threeActions' : 'fourActions')
            },
            freeUpgradeSetup(player) {
                const availableUpgrades = [];
                for (let unlockKey in player.unlockArrayIndex) {
                    if (player.unlockArrayIndex[unlockKey] < unlockMapMaxValues[unlockKey] - 1) {
                        availableUpgrades.push(unlockKey)
                        // Need a method to create all these buttons. The onclick will be
                        // a gameController method which takes in the kind of upgrade 
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
            useFreeUpgrade(upgradeType, playerId) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;

                gameController.performUnlock(player, upgradeType)
                gameController.finishTokenUsage(player, 'freeUpgrade')
            },
            switchPost() {
                logicBundle.inputHandlers.clearAllActionSelection();
                logicBundle.inputHandlers.selectedAction = 'switchPostSelection';
                logicBundle.inputHandlers.updateActionInfoText('Select two spots in the same city to exchange. You must own one of them.');
            },
            selectedPostToSwitch(cityId, citySpotNumber, playerId) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
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
                // 1. Need to switch the colors on the board pieces, 
                logicBundle.boardController.switchPieceColor(`piece-${previousCityId}-${previousSpotNumber}`, `piece-${cityId}-${citySpotNumber}`)
                // 2. Need to switch the locations in cityStorage
                gameController.cityStorageObject[previousCityId].occupants[previousSpotNumber] = occupantTwo;
                gameController.cityStorageObject[cityId].occupants[citySpotNumber] = occupantOne;
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
                logicBundle.inputHandlers.updateActionInfoText('Select an opposing piece and a location to move it to. You can do this three times');
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
            selectMoveThreeLocation(nodeId, playerId) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;
                console.log('selectMoveThreeLocation', nodeId)
                // 1. First get the reference to the node
                const routeId = getRouteIdFromNodeId(nodeId);
                const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]
                console.log(node)
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
                const originPlayer = gameController.playerArray[originNode.playerId]
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

                // 10. Decrement the gameController.tokenUsageInformation.movesLeft - if
                // it's zero we call this.endMoveThree
                gameController.tokenUsageInformation.movesLeft--;
                if (gameController.tokenUsageInformation.movesLeft === 0) {
                    this.endMoveThree();
                    return;
                }
                // 11. Otherwise we update the tokenUI and actionInfo UI texts
                // 12. Then change the logicBundle.inputHandlers.additionalInfo back to 'selectPiece'
                logicBundle.inputHandlers.updateActionInfoText('Select an opposing piece and a location to move it to. You can do this three times');
                logicBundle.inputHandlers.populateMoveThreeMenu(gameController.tokenUsageInformation.movesLeft)
                logicBundle.inputHandlers.additionalInfo = 'selectPiece';
                gameController.tokenUsageInformation.originLocation = undefined;
            },
            endMoveThree(playerId) {
                const player = gameController.validatePlayerIsActivePlayer(playerId, gameController.getActivePlayer());
                if (!player) {
                    return
                }
                playerId = player.id;
                // 1. Reset logicBundle.inputHandlers. I think this should clear the token area and re-enable the action buttons
                logicBundle.inputHandlers.toggleInputButtons(false)
                logicBundle.inputHandlers.clearAllActionSelection()
                // 2. Trigger the finishTokenUsage method
                gameController.finishTokenUsage(player, 'moveThree');
            }
        },
        endGame() {
            // TODO
            console.warn('The game ended but I have not implemented end game point calculations yet. Sorry.')
        },
        validatePlayerIsActivePlayer(playerId, activePlayer) {
            if (IS_HOTSEAT_MODE) {
                return activePlayer
            }
            if (playerId !== activePlayer.id) {
                console.warn('Player attempting to take an off-turn action')
                // TODO warn the inputHandlers API
                return false;
            }
        },
        saveGame(){
            console.warn('Saving game')
            // Here!
            // dev
            /* 
            * Player array
            * game log history
            * city array
            * route array
            * current player (as in whose turn it is)
            * I think points and city pieces and everything board state/player board can
            * be derived from the above
            */
            window.localStorage.setItem('isSaved', true)
            // Will need to use JSON.stringify() as we can only save string values
            window.localStorage.setItem('playerArray', JSON.stringify(this.playerArray))
            window.localStorage.setItem('cityStorageObject', JSON.stringify(this.cityStorageObject))
            window.localStorage.setItem('routeStorageObject', JSON.stringify(this.routeStorageObject))
        },
        loadGame(){
            // TODO - this will need to set the states for all the fields then populate
            // the point tracker, the board, the action tracker, the player info board, and the game log

            const storedPlayerArray = JSON.parse(window.localStorage.getItem('playerArray'))
            const storedCityStorageObject = JSON.parse(window.localStorage.getItem('cityStorageObject'))
            const storedRouteStorageObject = JSON.parse(window.localStorage.getItem('routeStorageObject'))
            console.log(storedCityStorageObject)
            console.log(storedPlayerArray)
            console.log(storedRouteStorageObject)
            // here!
            // let's follow the example of initializeGameStateAndUI()
            // I think we're going to have to add a big 'resume' method to everything
            // actually maybe we *DO* call initializeGameStateAndUI, after all, we still need to build
            // the board and components. We just need to populate them  after being built
            // this.initializeGameStateAndUI(playerList, boardConfig);
            // I think we need to change initializeGameStateAndUI to be a little more agnostic so that we can 
            // use it here as it expects playerList and boardConfig
        }
    }
    logicBundle.gameController = gameController;
    return gameController
}

