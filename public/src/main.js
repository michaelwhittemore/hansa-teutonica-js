// CONSTANTS
const STARTING_BANK = 15; // no clue if this is correct (GAME RULES) - see https://cdn.1j1ju.com/medias/df/af/68-hansa-teutonica-big-box-rulebook.pdf - page 3 for settup
const FIRST_PLAYER_SQUARES = 6;
const TEST_PLAYERS_NAMES = ['Alice', 'Bob', 'Claire', 'Phil']
const TEST_PLAYER_COLORS = ['red', 'blue', 'green', 'pink']
const NON_MOVE_BUTTON_LIST = ['place', 'bump', 'resupply', 'capture', 'upgrade', 'token'];
const IS_HOTSEAT_MODE = true;
const USE_DEFAULT_CLICK_ACTIONS = true;
const APPROXIMATE_NODE_OFFSET = 45 / 2;

// location is a coordinates x, y offset from the origin in the top right
const TEST_BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3], ['Zeta', 3]],
        unlock: 'action',
        location: [20, 20]
    },
    'Beta': {
        name: 'Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['Gamma', 4]],
        unlock: 'purse',
        location: [450, 20]
    },
    'Gamma': {
        name: 'Gamma',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        neighborRoutes: [['Delta', 3], ['Zeta', 3]],
        unlock: 'unlockedColors',
        location: [600, 500]
    },
    'Delta': {
        name: 'Delta',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [1000, 300],
        neighborRoutes: [['Epsilon', 3]],
    },
    'Epsilon': {
        name: 'Epsilon',
        unlock: 'keys',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [900, 20]
    },
    'Zeta': {
        name: 'Zeta',
        unlock: 'movement',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [30, 450],
    },

};

// The below can be used to fix my name mapping issue, but then deleted I think
const PLAYER_FIELDS_TO_TEXT_MAP = {
    name: 'Name',
    color: 'Color',
    keys: 'Keys',
    unlockedColors: 'Unlocked Colors',
    supplySquares: 'Traders (Squares) in Supply',
    bankedSquares: 'Traders (Squares) in Bank',
    supplyCircles: 'Merchants (Circles) in Supply',
    bankedCircles: 'Merchants (Circles) in Bank',
    maxActions: 'Max Actions',
    currentActions: 'Actions Remaining',
    currentPoints: 'Current Non-Endgame Points',
    maxMovement: 'Maximum Piece Movement',
    purse: 'Maximum Resupply'
}

// Helper Functions:
const isShape = (inputString) => inputString === 'square' || inputString === 'circle';
const createDivWithClassAndIdAndStyle = (classNameArray, id, styles) => {
    // classNameArray is an array of strings, id is an optional string, styles is an optional object
    const div = document.createElement('div');
    div.classList.add(...classNameArray);
    if (id !== undefined) {
        div.id = id;
    }
    if (styles) {
        Object.keys(styles).forEach(style => {
            div.style[style] = styles[style]
        });
    }

    return div
}
const getRouteIdFromNodeId = (nodeId) => {
    return nodeId.slice(0, nodeId.lastIndexOf('-'));
}
const offSetCoordinatesForSize = (x, y, height = 45, width = 45) => {
    // This function will center an object instead of placing it with the top left at (x,y)
    return ([x - (width / 2), y - (height / 2)]);
}

const offSetCoordinatesForGameBoard = (x, y) => {
    gameBoardDomRect = document.getElementById('gameBoard').getBoundingClientRect()
    return [x - gameBoardDomRect.x, y - gameBoardDomRect.y]
}

const calculateSlopeFromCoordinatePairs = (x1, y1, x2, y2) => {
    return (y2 - y1) / (x2 - x1)
}

const findEdgeIntersectionPointFromRects = (rect1, rect2) => {
    const xCenter1 = rect1.x + (0.5 * rect1.width)
    const yCenter1 = rect1.y + (0.5 * rect1.height)
    const xCenter2 = rect2.x + (0.5 * rect2.width)
    const yCenter2 = rect2.y + (0.5 * rect2.height)
    const center1 = [xCenter1, yCenter1];
    const center2 = [xCenter2, yCenter2]

    const xDelta = xCenter2 - xCenter1;
    const yDelta = yCenter2 - yCenter1;

    const slope = calculateSlopeFromCoordinatePairs(xCenter1, yCenter1, xCenter2, yCenter2)

    const getEdgesForCity = (rect, xDelta, yDelta, isOppositeDirection = false) => {
        let verticalEdge;
        let horizontalEdge;
        if (isOppositeDirection) {
            xDelta = xDelta * -1
            yDelta = yDelta * -1
        }

        if (xDelta > 0) {
            // we're moving to the right
            verticalEdge = rect.x + rect.width; // edges come in two forms -- (x + width), (y + height) or just x,y
        } else if (xDelta < 0) {
            // Moving to the left
            verticalEdge = rect.x;
        } else if (xDelta === 0) {
            // moving straight down, no chance of a vertical edge
            verticalEdge === false;
        }
        if (yDelta > 0) {
            // moving down
            horizontalEdge = rect.y + rect.height;
        } else if (yDelta < 0) {
            // Moving to the up
            horizontalEdge = rect.y;
        } else if (yDelta === 0) {
            // moving straight horizontally, no chance of a horizontal edge
            horizontalEdge === false;
        }
        return [verticalEdge, horizontalEdge]
    }
    const [verticalEdge1, horizontalEdge1] = getEdgesForCity(rect1, xDelta, yDelta);
    const [verticalEdge2, horizontalEdge2] = getEdgesForCity(rect2, xDelta, yDelta, true);

    const findVerticalIntersection = (verticalEdge, center) => {
        if (verticalEdge === false) {
            console.warn('verticalEdge is false')
        }
        const innerXDelta = verticalEdge - center[0];

        const yIntersection = center[1] + (slope * innerXDelta)
        const verticalIntersection = [verticalEdge, yIntersection]
        // const offsetCoordinates1 = offSetCoordinatesForGameBoard(...verticalIntersection);
        // addPixelAtLocation(...offsetCoordinates1, true)
        return verticalIntersection
    }

    const findHorizontalIntersection = (horizontalEdge, center) => {
        if (horizontalEdge === false) {
            console.warn('horizontalEdge is false')
        }
        const inverseSlope = (1 / slope);

        const innerYDelta = horizontalEdge - center[1];
        const xIntersection = center[0] + (inverseSlope * innerYDelta)
        const horizontalIntersection = [xIntersection, horizontalEdge]
        // const offsetCoordinates2 = offSetCoordinatesForGameBoard(...horizontalIntersection);
        // addPixelAtLocation(...offsetCoordinates2, true, 'red')

        return horizontalIntersection
    }

    const findCloserIntersection = (verticalIntersection, horizontalIntersection, center) => {
        const deltaVertical = Math.abs(center[0] - verticalIntersection[0]) + Math.abs(center[1] - verticalIntersection[1])
        const deltaHorizontal = Math.abs(center[0] - horizontalIntersection[0]) + Math.abs(center[1] - horizontalIntersection[1])
        let coordinates;
        if (Number.isNaN(deltaVertical)) {
            coordinates = horizontalIntersection
        } else if (Number.isNaN(deltaHorizontal)) {
            coordinates = verticalIntersection
        } else {
            if (deltaVertical === deltaHorizontal) {
                console.error('I guess this is a corner case? Get it? A literal corner')
                coordinates = horizontalIntersection
            } else if (deltaVertical < deltaHorizontal) {
                coordinates = verticalIntersection
            } else if (deltaVertical > deltaHorizontal) {
                coordinates = horizontalIntersection
            }
        }
        // const offsetCoordinates = offSetCoordinatesForGameBoard(...coordinates);
        // addPixelAtLocation(...offsetCoordinates, true, 'green')
        return coordinates;
    }

    const verticalIntersection1 = findVerticalIntersection(verticalEdge1, center1)
    const horizontalIntersection1 = findHorizontalIntersection(horizontalEdge1, center1)
    const intersection1 = findCloserIntersection(verticalIntersection1, horizontalIntersection1, center1)

    const verticalIntersection2 = findVerticalIntersection(verticalEdge2, center2)
    const horizontalIntersection2 = findHorizontalIntersection(horizontalEdge2, center2)
    const intersection2 = findCloserIntersection(verticalIntersection2, horizontalIntersection2, center2)

    return [intersection1, intersection2]
}

const calculatePathBetweenElements = (element1, element2) => {
    // drawLine(element1, element2);

    const domRect1 = element1.getBoundingClientRect()
    const domRect2 = element2.getBoundingClientRect()

    const [target1, target2] = findEdgeIntersectionPointFromRects(domRect1, domRect2)
    return {
        startX: target1[0],
        startY: target1[1],
        endX: target2[0],
        endY: target2[1]
    }
}

const drawLine = (element1, element2) => {
    const LINE_LENGTH = 25
    const domRect1 = element1.getBoundingClientRect()
    const domRect2 = element2.getBoundingClientRect()
    const xCenter1 = domRect1.x + (0.5 * domRect1.width)
    const yCenter1 = domRect1.y + (0.5 * domRect1.height)
    const xCenter2 = domRect2.x + (0.5 * domRect2.width)
    const yCenter2 = domRect2.y + (0.5 * domRect2.height)

    gameBoardDomRect = document.getElementById('gameBoard').getBoundingClientRect()
    const xOffset = gameBoardDomRect.x
    const yOffset = gameBoardDomRect.y;

    const xDelta = xCenter2 - xCenter1;
    const yDelta = yCenter2 - yCenter1;
    for (let i = 0; i < LINE_LENGTH; i++) {
        addPixelAtLocation(xCenter1 - xOffset + i * (xDelta / LINE_LENGTH),
            yCenter1 - yOffset + i * (yDelta / LINE_LENGTH))
    }
    addPixelAtLocation(xCenter1 - xOffset, yCenter1 - yOffset)
    addPixelAtLocation(xCenter2 - xOffset, yCenter2 - yOffset)
}

const inputHandlers = {
    verifyPlayersTurn() {
        // THE LOGIC IS THAT IN NON-HOTSEAT PLAY THE INPUTHANDLER SHOULD TELL YOU TO WAIT
        // IT SHOULDN'T BE THE gameController's responsbility (I think??)

        // if not true will update action info with 'It isn't your turn'
        // pretend this checks if it's the correct player's turn 
        return true;
    },
    handleUpgradeButton() {
        inputHandlers.clearAllActionSelection();

        inputHandlers.selectedAction = 'upgrade'
        inputHandlers.updateActionInfoText("Select a city corresponding to an upgrade.", true)
    },
    handlePlaceButton() {
        inputHandlers.clearAllActionSelection();

        if (!inputHandlers.verifyPlayersTurn()) {
            return;
        }
        inputHandlers.selectedAction = 'place'
        inputHandlers.updateActionInfoText("Select a kind of piece to place and a location")
        inputHandlers.addShapeSelectionToActionInfo()
    },
    handleBumpButton() {
        // DEV 1

        // NOTE this plan is *non-exhaustive* we don't take into account any clean up or UI updates
        // or necessary refactoring

        // There's two parts - the first is pretty easy
        // Use our standard flow to have the player select which oposing piece they want to bump and with what
        // We need to verify the player can pay the correct amount from their stock (rulebook page 4)
        // Once that's done we will need to pause our normal input flow to take care of the piece owner selecting where to place

        // Remember that behavior changes when it's a circle
        // I think we first need to figure out how to pass the turn (the turn stays the same
        // -but we want to add some addttional information to the turn tracker)
        // The game controller will need a sperate field to figure  out who is the active player
        // name TBD, but we want some special name for the player to distinguish them from the player
        // whose turn it currently is)

        // We also need some computational logic to figure out how far the 

        // We will need to add TWO Additional sections to the nodeClickHandler. At this point it might make
        // sense to break out the nodeClickHandler into a lot of functions based on the inputHandlers.selectedAction
        // field
        // speaking of which, we will need to add two kinds of  new 'selectedAction's

        inputHandlers.clearAllActionSelection();
        inputHandlers.selectedAction = 'selectPieceToBump'
        inputHandlers.updateActionInfoText('Select a shape to replace your rivals with, then select their piece.')
        inputHandlers.addShapeSelectionToActionInfo()
    },
    handleMoveButton() {
        if (inputHandlers.selectedAction === 'move') {
            document.getElementById('move').innerText = 'Move Pieces'
            inputHandlers.clearAllActionSelection();
            gameController.endMoveAction();
            return;
        }
        inputHandlers.clearAllActionSelection();
        inputHandlers.toggleNonMoveButtons(true)

        document.getElementById('move').innerText = 'End Move Action';

        inputHandlers.selectedAction = 'move'
        inputHandlers.additionalInfo = 'selectPieceToMove'

        inputHandlers.updateActionInfoText('Select one of your own pieces to move.')
    },
    handleCaptureCityButton() {
        inputHandlers.clearAllActionSelection();

        inputHandlers.selectedAction = 'capture';
        if (!inputHandlers.selectedLocation) {
            inputHandlers.updateActionInfoText('Select a city to capture', true);
        } else {
            let playerId = undefined
            if (!IS_HOTSEAT_MODE) {
                // get the player name from localstorage
            }
            gameController.captureCity(inputHandlers.selectedLocation, playerId)
        }

    },
    handleResupplyButton() {
        let playerId = undefined
        if (!IS_HOTSEAT_MODE) {
            // get the player name from localstorage
        }
        gameController.resupply(playerId);
    },

    clearAllActionSelection() {
        // NOTE: I should *NOT* be using this just to clear action info
        document.getElementById('move').innerText = 'Move Pieces'
        inputHandlers.selectedAction = undefined;
        inputHandlers.selectedLocation = undefined;
        inputHandlers.additionalInfo = undefined;

        document.getElementById('actionInfo').innerHTML = ''
        document.getElementById('warningText').innerHTML = ''
    },
    bindInputHandlers() {
        document.getElementById('place').onclick = this.handlePlaceButton;
        document.getElementById('move').onclick = this.handleMoveButton;
        document.getElementById('bump').onclick = this.handleBumpButton;
        document.getElementById('resupply').onclick = this.handleResupplyButton;
        document.getElementById('capture').onclick = this.handleCaptureCityButton;
        document.getElementById('upgrade').onclick = this.handleUpgradeButton;
    },
    toggleNonMoveButtons(disabled) {
        NON_MOVE_BUTTON_LIST.forEach(buttonName => {
            document.getElementById(buttonName).disabled = disabled;
        })
    },
    updateActionInfoText(text, overWrite = true) {
        // Eventually we might want action info to have its own controller object?
        // Especially given that we add buttons to it
        const actionInfoDiv = document.getElementById('actionInfo');
        if (overWrite) {
            actionInfoDiv.innerHTML = '';
        }
        actionInfoDiv.innerText += text;
    },
    addShapeSelectionToActionInfo() {
        const squareButton = document.createElement('button');
        squareButton.innerText = 'Square'
        squareButton.onclick = () => {
            inputHandlers.additionalInfo = 'square'
        }
        const actionInfoDiv = document.getElementById('actionInfo')
        actionInfoDiv.append(squareButton);
        const circleButton = document.createElement('button');
        circleButton.innerText = 'Circle'
        circleButton.onclick = () => {
            inputHandlers.additionalInfo = 'circle'
        }
        actionInfoDiv.append(circleButton);
    },
    warnInvalidAction(warningText) {
        document.getElementById('warningText').innerHTML = '';
        document.getElementById('warningText').innerText = warningText
    },
    cityClickHandler(cityId) {
        if (!inputHandlers.selectedAction) {
            if (USE_DEFAULT_CLICK_ACTIONS) {
                inputHandlers.selectedLocation = cityId;
                inputHandlers.selectedAction = 'capture';
            } else {
                // TODO handle no selected action on city click (presumably warn and clear)
                return;
            }
        };
        if (inputHandlers.selectedAction === 'capture') {
            // Might need to pass in player ID
            gameController.captureCity(cityId, undefined)
        }
        if (inputHandlers.selectedAction === 'upgrade') {
            // Might need to pass in player ID
            gameController.upgradeAtCity(cityId, undefined)
        }

    },
    routeNodeClickHandler(nodeId) {
        switch (inputHandlers.selectedAction) {
            case 'move':
                this.nodeActions.move(nodeId)
            break;
            case 'place':
                this.nodeActions.place(nodeId)
                break;
            case 'selectPieceToBump':
                this.nodeActions.selectPieceToBump(nodeId)
                break
            default:
                if (inputHandlers.selectedAction) {
                    console.error('We should noy be hitting default with a selected action')
                }
                if (USE_DEFAULT_CLICK_ACTIONS) {
                    inputHandlers.additionalInfo = 'square'
                    this.nodeActions.place(nodeId)
                } else {
                    console.warn('Nothing selected and no default')
                }
        }

    },
    nodeActions: {
        selectPieceToBump(nodeId){
            // Need to call a game controller method here
            // pass in the selected shape, other wise use default
            if (!isShape(inputHandlers?.additionalInfo)) {
                if (USE_DEFAULT_CLICK_ACTIONS) {
                    inputHandlers.additionalInfo = 'square'
                } else {
                    console.warn('No shape selected')
                    return;
                }
            }
            gameController.bumpPieceFromNode(nodeId, inputHandlers.additionalInfo);
        },
        place(nodeId) {
            if (!isShape(inputHandlers?.additionalInfo)) {
                if (USE_DEFAULT_CLICK_ACTIONS) {
                    inputHandlers.additionalInfo = 'square'
                } else {
                    console.warn('No shape selected')
                    return;
                }
            }
            gameController.placeWorkerOnNodeAction(nodeId, inputHandlers.additionalInfo);
        },
        move(nodeId){
            if (inputHandlers.additionalInfo === 'selectPieceToMove') {
                gameController.selectPieceToMove(nodeId)
            } else if (inputHandlers.additionalInfo === 'selectLocationToMoveTo') {
                gameController.movePieceToLocation(nodeId);
            }
        },
    }
}

const gameController = {
    initializeGameStateAndUI(playerNames, playerColors, boardConfig) {
        // let's just use turn order for IDs
        this.playerArray = []
        for (let i = 0; i < playerNames.length; i++) {
            const player = new Player(playerColors[i], playerNames[i], FIRST_PLAYER_SQUARES + i, i);
            this.playerArray.push(player)
        }
        playerInformationAndBoardController.initializePlayerInfoBoards(this.playerArray)
        turnTrackerController.updateTurnTracker(this.playerArray[0])
        this.currentTurn = 0;
        gameLogController.initializeGameLog();
        this.routeStorageObject = {}
        this.cityStorageObject = {};
        this.moveInformation = {};
        this.bumpInformation = {};
        inputHandlers.bindInputHandlers()
        // This make certain assumptions about the ordering cities, when we get location based this won't be an issue
        boardController.initializeUI(this.playerArray);

        // Let's break out the city generation into two loops
        // THe first one populates the cityStorageObject 
        // The second one will create the route
        Object.keys(boardConfig).forEach(cityKey => {
            const city = boardConfig[cityKey]
            const cityDiv = boardController.createCity({ ...city })
            // Let's add the city's element to it's properties
            this.cityStorageObject[cityKey] = {
                cityName: cityKey, // technically kinda useless
                occupants: [],
                openSpotIndex: 0,
                spotArray: city.spotArray,
                bonusSpotOccupantId: undefined,
                unlock: city.unlock,
                location: city.location,
                ownElement: cityDiv,
            }

        })
        Object.keys(boardConfig).forEach(cityKey => {
            const city = boardConfig[cityKey]
            if (city.neighborRoutes) {
                city.neighborRoutes.forEach(routeArray => {
                    const neighborCityName = routeArray[0]
                    const length = routeArray[1]
                    const routeId = `${city.name}-${neighborCityName}`
                    boardController.createRouteFromLocations({
                        length: routeArray[1],
                        id: routeId,

                        element1: this.cityStorageObject[cityKey].ownElement,
                        element2: this.cityStorageObject[neighborCityName].ownElement,
                    })
                    this.routeStorageObject[routeId] = {
                        cities: [cityKey, neighborCityName],
                        routeNodes: {},
                    }
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
    resumeGame(properties) {
        //TODO
    },
    getActivePlayer() {
        return this.playerArray[this.currentTurn % this.playerArray.length]
    },
    getPlayerById() {
        // TODO, only used for online play I think
    },
    advanceTurn(lastPlayer) {
        this.currentTurn++;
        turnTrackerController.updateTurnTracker(this.getActivePlayer())
        if (IS_HOTSEAT_MODE) {
            playerInformationAndBoardController.focusOnPlayerBoard(this.getActivePlayer())
        }

        lastPlayer.currentActions = lastPlayer.maxActions;
    },
    resolveAction(player) {
        gameController.moveInformation = {};
        gameController.bumpInformation = {};
        inputHandlers.clearAllActionSelection();
        // TODO The below inputHandlers.toggleNonMoveButtons maybe shoulkd just be tied to cleanup of
        // the input handlers? Like clearAllActionSelection?
        inputHandlers.toggleNonMoveButtons(false)
        player.currentActions -= 1;
        if (player.currentActions === 0) {
            this.advanceTurn(player);
        }
        turnTrackerController.updateTurnTracker(this.getActivePlayer())
        this.playerArray.forEach(player => {
            playerInformationAndBoardController.componentBuilders.updateSupplyAndBank(player)
        })

    },
    placeWorkerOnNodeAction(nodeId, shape, playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        // Validate that the player has enough supply and that the node is unoccupied
        const playerShapeKey = shape === 'square' ? 'supplySquares' : 'supplyCircles';
        if (player[playerShapeKey] < 1) {
            console.warn(`Not enough ${shape}s in your supply`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`Not enough ${shape}s in your supply!`)
            return
        }
        const routeId = getRouteIdFromNodeId(nodeId);
        if (this.routeStorageObject[routeId]?.routeNodes[nodeId]?.occupied) {
            console.warn('That route node is already occupied!')
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction('That route node is already occupied!')
            return
        }

        player[playerShapeKey] -= 1;
        this.placePieceOnNode(nodeId, shape, player);
        gameLogController.addTextToGameLog(`$PLAYER_NAME placed a ${shape} on ${nodeId}`, player)
        this.resolveAction(player)
    },
    placePieceOnNode(nodeId, shape, player){
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
        boardController.addPieceToRouteNode(nodeId, player.color, shape);

    },
    selectPieceToMove(nodeId, playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }

        const routeId = getRouteIdFromNodeId(nodeId)
        const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]

        if (!node.occupied || node.playerId !== playerId) {
            console.warn('You do not have a piece on this route node.')
            inputHandlers.warnInvalidAction('You do not have a piece on this route node.');
            return;
        } else {
            if (gameController.moveInformation.movesUsed === undefined) {
                gameController.moveInformation.movesUsed = 0;
            }

            inputHandlers.additionalInfo = 'selectLocationToMoveTo'
            inputHandlers.updateActionInfoText(`You have a selected a ${node.shape}. Select an unoccupied route node to move there.`)
            gameController.moveInformation.originNode = node;
        }
    },
    movePieceToLocation(nodeId, playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        const routeId = getRouteIdFromNodeId(nodeId)
        const targetNode = gameController.routeStorageObject[routeId].routeNodes[nodeId]

        const originNode = gameController.moveInformation.originNode;
        const shape = originNode.shape
        if (targetNode.occupied) {
            console.warn('This route node is already occupied.')
            inputHandlers.warnInvalidAction('This route node is already occupied.');
            return;
        }
        this.placePieceOnNode(nodeId, shape, player);

        gameLogController.addTextToGameLog(
            `$PLAYER_NAME moved a ${shape} from ${originNode.nodeId} to ${nodeId}`, player)
        const clearedProps = {
            occupied: false,
            shape: undefined,
            color: undefined,
            playerId: undefined,
        };
        Object.assign(originNode, clearedProps);
        boardController.clearPieceFromRouteNode(originNode.nodeId)
        gameController.moveInformation.movesUsed++;
        if (gameController.moveInformation.movesUsed === player.maxMovement) {
            console.warn('used up all move actions')
            this.endMoveAction(playerId)
            return;
        }
        inputHandlers.updateActionInfoText(
            `Select one of your own pieces to move. You have ${player.maxMovement - gameController.moveInformation.movesUsed} left.`)
        inputHandlers.additionalInfo = 'selectPieceToMove';
    },
    endMoveAction(playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        inputHandlers.toggleNonMoveButtons(false)
        // The player never actually took an action, works for zero or undefined
        if (!gameController.moveInformation.movesUsed) {
            inputHandlers.clearAllActionSelection()
            return;
        } else {
            gameLogController.addTextToGameLog(
                `$PLAYER_NAME moved ${this.moveInformation.movesUsed} pieces.`, player)
            this.resolveAction(player)
        }
    },
    resupply(playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        inputHandlers.clearAllActionSelection();
        if (player.bankedCircles === 0 && player.bankedSquares === 0) {
            console.warn('There is nothing in your bank to resupply with.')
            inputHandlers.warnInvalidAction('There is nothing in your bank to resupply with.')
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
        gameLogController.addTextToGameLog(`$PLAYER_NAME resupplied ${resuppliedCircles} circles and ${resuppliedSquares} squares.`, player);
        this.resolveAction(player)
        // eventually should chose circles vs squares, right now default to all circles, then square
    },
    bumpPieceFromNode(nodeId, shape, playerId){
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }

        // 1. First verify that another player controls this location - if not warn and return
        const routeId = getRouteIdFromNodeId(nodeId)
        const node = gameController.routeStorageObject[routeId].routeNodes[nodeId]
        console.log(node)
        if (!node.occupied || node.playerId === playerId){
            console.warn('The route node needs to be occupied by a rival player.')
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction('The route node needs to be occupied by a rival player.')
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
        if (bumpedShape === 'circle'){
            squareCost++;
            circlesToPlace++;
        };
        // Update the cost to include the piece being placed
        if (shape === 'square'){
            squareCost++;
        } else {
            circleCost++;
        }
        // 4. Check that the player has sufficient supply - if not warn and end
        if (player.supplySquares < squareCost || player.supplyCircles < circleCost){
            console.warn(`You need at least ${squareCost} squares and ${circleCost} circles in your supply`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You need at least ${squareCost} squares and ${circleCost} circles in your supply`);
            return 
        }
        // 5. If they do, move the tax from supply to bank (also account for the piece being moved)
        player.supplySquares -= squareCost;
        player.bankedSquares += squareCost;
        player.supplyCircles -= circleCost;
        player.bankedCircles -= circleCost;
        if (shape === 'square'){
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
        boardController.clearPieceFromRouteNode(nodeId)
        this.bumpInformation.bumpedShape = bumpedShape;
        // May need additional bumpInformation

        // 8. Then we place the active player piece and update the nodeStorage object
        this.placePieceOnNode(nodeId, shape, player);


        // DEV 2
        // 9. Then we update the active player info area to make it clear that we're in a weird half-turn
        // We already have turnTrackerAdditionalInformation
        turnTrackerController.updateTurnTrackerWithBumpInfo({
            bumpingPlayer: player,
            bumpedPlayer: this.playerArray[bumpedPlayerId],
            circlesToPlace,
            squaresToPlace
        })
        // 10. We will need a new method an subarea for this part of the action player
        // 11. This should be delete as part of the cleanup
        // 12. Then update inputHandler.selectedAction
        // 13. We will need to store how many moves and pieces they have and show it 
        // 14. Rememember that they get bonus pieces from the bank, and they might not have enough
        // But the piece they had on the board is free
        // 15. We will need an adjenctRoute helper method. This will validate that they can't move randomly
        // 16. This will take a lot of work and should probably be tested
        // 17. All of that will need to be part of a TBD name game controller method
        // 18. Also include gameLogging
    },
    captureCity(cityName, playerId) {
        // TODO Eventually we will need to deal with a player who has multiple completed routes to a single city
        // probably use an onclick for a route node. Let's deal with that later
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        inputHandlers.clearAllActionSelection();
        const city = this.cityStorageObject[cityName]

        const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
        const { routeId } = routeCheckOutcome

        if (!routeCheckOutcome) {
            console.warn('You do not have a completed route')
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction('You do not have a completed route');
            return;
        };
        if (player.currentActions === 0) {
            // I don't think we should reach here???
            console.error('You don\'t have enough actions, how did you even get here? The turn was supposed to advance!')
            return;
        }
        if (city.openSpotIndex === city.spotArray) {
            console.warn(`The city of ${city.cityName} is already full.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`The city of ${city.cityName} is already full.`);
            return;
        }
        const [targetShape, targetColor] = city.spotArray[city.openSpotIndex]
        if (!player.unlockedColors.includes(targetColor)) {
            console.warn(`You haven't unlocked ${targetColor}.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You haven't unlocked ${targetColor}.`);
            return
        }
        if (routeCheckOutcome[targetShape] === 0) {
            console.warn(`You don't have a ${targetShape} in your route.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You don't have a ${targetShape} in your route.`);
            return
        }
        boardController.addPieceToCity(city, player.color)
        routeCheckOutcome[targetShape]--;

        player.bankedCircles += routeCheckOutcome.circle;
        player.bankedSquares += routeCheckOutcome.square;

        // We need to do route completion first for point calculation
        this.routeCompleted(routeId, player);
        city.occupants.push(playerId);
        city.openSpotIndex++;

        gameLogController.addTextToGameLog(`$PLAYER_NAME captured the city of ${cityName}`, player);
        this.resolveAction(player);
    },
    upgradeAtCity(cityName, playerId) {
        let player;
        if (IS_HOTSEAT_MODE) {
            player = this.getActivePlayer()
            playerId = player.id
        } else {
            // TODO, check that the playerId who made the request is the active player
        }

        city = this.cityStorageObject[cityName]

        const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
        const { routeId } = routeCheckOutcome
        console.log(city)
        if (!city.unlock) {
            console.warn(`The city of ${city.name} doesn't have a corresponding unlock.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`The city of ${city.name} doesn't have a corresponding unlock.`);
            return;
        }
        if (!routeCheckOutcome) {
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction('You can not upgrade without a completed route.');
            return;
        };

        const noFurtherUpgrades = (unlockName) => {
            console.warn(`You can't upgrade your ${unlockName} any further.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You can't upgrade your ${unlockName} any further.`);
        }

        switch (city.unlock) {
            case 'purse':
                if (player.unlockArrayIndex.purse === unlockPurseToValue.length - 1) {
                    noFurtherUpgrades('resupply capacity');
                    return;
                }
                player.unlockArrayIndex.purse++;
                player.purse = unlockPurseToValue[player.unlockArrayIndex.purse];
                gameLogController.addTextToGameLog(`$PLAYER_NAME has upgraded their resupply. They now have ${player.purse}.`, player)
                playerInformationAndBoardController.unlockPieceFromBoard(player, player.unlockArrayIndex.purse, city.unlock)
                break;
            case 'action':
                if (player.unlockArrayIndex.actions === unlockActionsToValue.length - 1) {
                    noFurtherUpgrades('actions');
                    return;
                }
                player.unlockArrayIndex.actions++;
                player.maxActions = unlockActionsToValue[player.unlockArrayIndex.actions];
                // We only give the player a free action when they are actually advancing the total
                // i.e. not going from 3 -> 3 at index 1 ->2
                let actionUpgradeText = `$PLAYER_NAME has upgraded their actions per turn. They now have ${player.maxActions}.`
                if ([1, 3, 5].includes(player.unlockArrayIndex.actions)) {
                    player.currentActions++;
                    actionUpgradeText += ' They get a free action as a result'
                }
                gameLogController.addTextToGameLog(actionUpgradeText, player);
                playerInformationAndBoardController.unlockPieceFromBoard(player, player.unlockArrayIndex.actions, city.unlock)
                break;
            case 'unlockedColors':
                if (player.unlockArrayIndex.colors === unlockColorsToValue.length - 1) {
                    noFurtherUpgrades('available colors');
                    return;
                }
                player.unlockArrayIndex.colors++;
                player.unlockedColors.push(unlockColorsToValue[player.unlockArrayIndex.colors]);
                gameLogController.addTextToGameLog(`$PLAYER_NAME has upgraded their available colors. They can now place pieces on ${player.unlockedColors.slice(-1)}.`, player)
                playerInformationAndBoardController.unlockPieceFromBoard(player, player.unlockArrayIndex.colors, 'color')
                break;
            case 'movement':
                if (player.unlockArrayIndex.maxMovement === unlockMovementToValue.length - 1) {
                    noFurtherUpgrades('pieces moved per action');
                    return;
                }
                player.unlockArrayIndex.maxMovement++;
                player.maxMovement = unlockMovementToValue[player.unlockArrayIndex.maxMovement];
                gameLogController.addTextToGameLog(`$PLAYER_NAME has upgraded their maximum movement. They now have ${player.maxMovement}.`, player)
                playerInformationAndBoardController.unlockPieceFromBoard(player, player.unlockArrayIndex.maxMovement, 'moves')
                break;
            case 'keys':
                if (player.unlockArrayIndex.keys === unlockKeysToValue.length - 1) {
                    noFurtherUpgrades('route multiplier');
                    return;
                }
                player.unlockArrayIndex.keys++;
                player.keys = unlockKeysToValue[player.unlockArrayIndex.keys];
                gameLogController.addTextToGameLog(`$PLAYER_NAME has upgraded their route multiplier. They now have ${player.keys}.`, player)
                playerInformationAndBoardController.unlockPieceFromBoard(player, player.unlockArrayIndex.keys, city.unlock)
                break;
            default:
                console.error('we should not hit the default')
        }
        if (city.unlock === 'movement') {
            gameLogController.addTextToGameLog(`$PLAYER_NAME has unlocked a circle for their supply.`, player);
            player.supplyCircles++;
        } else {
            gameLogController.addTextToGameLog(`$PLAYER_NAME has unlocked a square for their supply.`, player)
            player.supplySquares++
        }
        // TODO would make sense to move the bank update to routeCompleted Method
        player.bankedCircles += routeCheckOutcome.circle;
        player.bankedSquares += routeCheckOutcome.square;
        this.routeCompleted(routeId, player);
        this.resolveAction(player);
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
        // playerId can be zero, so can't just check that it exists
        if (city.bonusSpotOccupantId !== undefined) {
            controlObj[city.bonusSpotOccupantId]++;
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
        // It will also check for tokens (we will need to create a token holder when initializing routes)
        gameLogController.addTextToGameLog(`$PLAYER_NAME has completed route ${routeId}`, player)
        const route = this.routeStorageObject[routeId]
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
            boardController.clearPieceFromRouteNode(nodeToClearId)
        }
    },
    scorePoints(pointValue, player) {
        const pointScoreText = `$PLAYER_NAME scored ${pointValue} point${pointValue === 1 ? '' : 's'}!`
        gameLogController.addTextToGameLog(pointScoreText, player)
        player.currentPoints += pointValue;
        boardController.updatePoints(player.currentPoints, player.color)
    }
}

// The interface does NOT track game state, just renders and creates buttons (although it can track its own state)
const boardController = {
    // Will probably need to load this in from a file, 
    initializeUI(playerArray) {
        this.board = document.getElementById('gameBoard');
        this.board.innerHTML = ''
        this.initializePointTracker(20, playerArray);
        this.pointTrackerInfo = []
        // The rest of the building is done by the game controller as it loads the board data

        const collapseButton = document.createElement('button');
        collapseButton.innerText = 'Collapse Board';
        collapseButton.className = 'collapseButton';
        collapseButton.onclick = () => this.toggleBoardView(collapseButton)
        document.getElementById('boardContainer').append(collapseButton)
        this.isCollapsed = false;
    },
    toggleBoardView(collapseButton) {
        if (!this.isCollapsed) {
            this.board.classList.add('collapsedContainer')
            collapseButton.innerText = 'Expand Board'
        } else {
            this.board.classList.remove('collapsedContainer')
            collapseButton.innerText = 'Collapse Board'
        }
        this.isCollapsed = !this.isCollapsed
    },
    initializePointTracker(maxPoints, playerArray) {
        // TODO Perhaps the point tracker should live outside of board controller
        const pointTracker = document.getElementById('pointTrackerSection-1');
        for (let i = 0; i <= maxPoints; i++) {
            const pointPieceContainer = document.createElement('div');
            pointPieceContainer.className = 'pointPieceContainer'
            pointPieceContainer.id = `points-${i}`;
            pointPieceContainer.innerText = i;
            pointTracker.append(pointPieceContainer);
        }
        playerArray.forEach(player => {
            this.updatePoints(0, player.color)
        })
    },
    updatePoints(pointTarget, playerColor) {
        // would be nice to evntually remove the number, but this works for now
        // TODO I think I can make the number it's own div and make it absolute (maybe need to play with z index)
        document.getElementById(`point-tracker-${playerColor}`)?.remove()
        const pointTrackerPiece = document.createElement('div');
        pointTrackerPiece.className = 'pointTrackerPiece';
        pointTrackerPiece.style.backgroundColor = playerColor;
        pointTrackerPiece.id = `point-tracker-${playerColor}`;
        document.getElementById(`points-${pointTarget}`).append(pointTrackerPiece)
    },
    createCity(cityInformation) {
        const { name, spotArray, unlock, location } = cityInformation;
        const cityDiv = document.createElement('button');
        cityDiv.className = 'city'
        // We assume all cities have unique names as identifiers 
        cityDiv.id = name
        cityDiv.innerText = name;
        if (unlock) {
            cityDiv.innerText += `\n Unlocks: ${unlock}`
        }
        const cityPieceAreaDiv = createDivWithClassAndIdAndStyle(['cityPieceArea'])
        cityDiv.append(cityPieceAreaDiv)
        for (let i = 0; i < spotArray.length; i++) {
            const spotInfo = spotArray[i]
            const citySpotDiv = document.createElement('div');
            citySpotDiv.className = `big-${spotInfo[0]}`;
            citySpotDiv.classList.add('cityPieceHolder') // TODO make a one liner
            citySpotDiv.id = `${name}-${i}`
            citySpotDiv.style.backgroundColor = spotInfo[1]
            cityPieceAreaDiv.append(citySpotDiv)
        }

        // Adding location, will need to do route calculation seperatley - might want to hard code
        // some information on sizes to a constant in case I make style changes
        cityDiv.style.left = `${location[0]}px`
        cityDiv.style.top = `${location[1]}px`

        cityDiv.onclick = () => {
            inputHandlers.cityClickHandler(name)
        }
        this.board.append(cityDiv)
        return cityDiv
    },
    createRouteFromLocations(routeProperties) {
        const { length, id, element1, element2 } = routeProperties
        let { startX, startY, endX, endY } = calculatePathBetweenElements(element1, element2)

        const xDelta = endX - startX;
        const yDelta = endY - startY
        const xIncrement = xDelta / (length + 1)
        const yIncrement = yDelta / (length + 1)

        for (let i = 0; i < length; i++) {
            const routeNode = document.createElement('button');
            routeNode.className = 'routeNode';
            const nodeId = `${id}-${i}`;
            routeNode.id = nodeId;
            routeNode.onclick = () => {
                inputHandlers.routeNodeClickHandler(nodeId)
            }

            let [xCoordinate, yCoordinate] = offSetCoordinatesForGameBoard(startX + (xIncrement * (i + 1)),
                startY + (yIncrement * (i + 1)))

            let [x, y] = offSetCoordinatesForSize(xCoordinate, yCoordinate)

            routeNode.style.left = x + 'px';
            routeNode.style.top = y + 'px';

            this.board.append(routeNode)
        }
    },
    addPieceToRouteNode(nodeId, playerColor, shape) {
        this.clearPieceFromRouteNode(nodeId);
        routeNode = document.getElementById(nodeId);
        playerPieceDiv = document.createElement('div');
        playerPieceDiv.className = `small-${shape}`;
        playerPieceDiv.style.backgroundColor = playerColor;
        routeNode.append(playerPieceDiv)
    },
    clearPieceFromRouteNode(nodeId) {
        routeNode = document.getElementById(nodeId);
        routeNode.innerHTML = ''
    },
    addPieceToCity(city, playerColor) {
        const pieceHolder = document.getElementById(`${city.cityName}-${city.openSpotIndex}`)
        const targetShape = city.spotArray[city.openSpotIndex][0];
        const playerPieceDiv = document.createElement('div')
        playerPieceDiv.className = `small-${targetShape}`
        playerPieceDiv.style.backgroundColor = playerColor;
        pieceHolder.append(playerPieceDiv)
    },
}

const playerInformationAndBoardController = {
    initializePlayerInfoBoards(playerArray) {
        this.playerBoardsObj = {}
        playerArray.forEach(player => {
            const playerInfoBoard = this.createInfoBoardForPlayer(player)
            document.getElementById('playerBoardArea').append(playerInfoBoard)
            this.playerBoardsObj[player.id] = playerInfoBoard;
        })

        let currentViewingPlayer;
        if (IS_HOTSEAT_MODE) {
            currentViewingPlayer = 0
        }
        this.focusOnPlayerBoard(playerArray[currentViewingPlayer])
        // Need to set the focused player before creating buttons
        document.getElementById('playerBoardAreaIncludingButton').prepend(this.createArrowButton('left', playerArray))
        document.getElementById('playerBoardAreaIncludingButton').append(this.createArrowButton('right', playerArray))



        const collapseButton = document.createElement('button');
        collapseButton.innerText = 'Collapse Player Board';
        collapseButton.className = 'collapseButton';
        collapseButton.onclick = () => this.togglePlayerInfo(collapseButton)
        document.getElementById('playerInfoBoardContainer').append(collapseButton)
        this.isCollapsed = false;
    },
    togglePlayerInfo(collapseButton) {
        // Need to move buttons to append to the playerBoardAreaIncludingButton
        if (!this.isCollapsed) {
            document.getElementById('playerBoardAreaIncludingButton').classList.add('collapsedContainer')
            collapseButton.innerText = 'Expand Player Board'
        } else {
            document.getElementById('playerBoardAreaIncludingButton').classList.remove('collapsedContainer')
            collapseButton.innerText = 'Collapse Player Board'
        }
        this.isCollapsed = !this.isCollapsed
    },
    createInfoBoardForPlayer(player) {
        const playerInfoBoard = document.createElement('div')
        playerInfoBoard.style.borderColor = player.color
        playerInfoBoard.className = 'playerInfoBoard'
        playerInfoBoard.id = `${player.id}-infoBoard`

        const playerBanner = document.createElement('div');
        playerBanner.className = 'playerInfoBoardBanner'
        playerBanner.style.color = player.color;
        playerBanner.innerText = player.name;
        playerInfoBoard.append(playerBanner)

        playerInfoBoard.append(this.componentBuilders.createKeysTracker(player))
        playerInfoBoard.append(this.componentBuilders.createTokenTracker(player))
        playerInfoBoard.append(this.componentBuilders.createActionTracker(player))
        playerInfoBoard.append(this.componentBuilders.createColorTracker(player))
        playerInfoBoard.append(this.componentBuilders.createMovesTracker(player))
        playerInfoBoard.append(this.componentBuilders.createPurseTracker(player))
        playerInfoBoard.append(this.componentBuilders.createSupplyTracker(player))
        playerInfoBoard.append(this.componentBuilders.createBankTracker(player));

        return playerInfoBoard
    },
    unlockPieceFromBoard(player, index, unlock) {
        // TODO add this to all the unlock game logic
        const divId = `${player.id}-${unlock}Div-${index}-shape-locked`
        console.log(divId)
        document.getElementById(divId).remove();
    },
    focusOnPlayerBoard(player) {
        this.focusedPlayerId = player.id;
        for (let playerId in this.playerBoardsObj) {
            // there are some real downsides to using indexes as object keys
            const parsedId = parseInt(playerId, 10)
            if (player.id === parsedId) {
                this.playerBoardsObj[parsedId].style.display = ''
            } else {
                this.playerBoardsObj[parsedId].style.display = 'none'
            }
        }
        for (let arrowButton of document.getElementsByClassName('arrowButton')) {
            const direction = arrowButton.id === ('arrow-left') ? 'left' : 'right'
            this.updateArrowButton(arrowButton, direction)
        }
    },
    createArrowButton(direction,) {
        // TODO test with more than two players
        const arrowButton = createDivWithClassAndIdAndStyle(['arrowButton'], `arrow-${direction}`);
        this.updateArrowButton(arrowButton, direction)
        return arrowButton
    },
    updateArrowButton(arrowButton, direction) {
        const playerArray = gameController.playerArray;
        let targetPlayerIndex = this.focusedPlayerId + (direction === 'left' ? -1 : 1)
        if (targetPlayerIndex < 0) {
            targetPlayerIndex = playerArray.length - 1
        } else {
            targetPlayerIndex = targetPlayerIndex % playerArray.length;
        }
        arrowButton.innerText = `Go ${direction} to ${playerArray[targetPlayerIndex].name}'s board.`
        arrowButton.innerText += direction === 'left' ? '\n <---' : '\n --->'
        arrowButton.style.borderColor = playerArray[targetPlayerIndex].color;

        arrowButton.onclick = () => {
            this.focusOnPlayerBoard(playerArray[targetPlayerIndex])
        }

    },
    componentBuilders: {
        createKeysTracker(player) {
            const keysTracker = document.createElement('div')
            keysTracker.className = 'keysTracker';
            keysTracker.id = `${player.id}-keysTracker`;
            for (let i = 0; i < unlockKeysToValue.length; i++) {
                const keysDiv = document.createElement('div');
                keysDiv.className = 'keysDiv';
                keysDiv.innerText = `Key ${unlockKeysToValue[i]}`
                keysDiv.append(this.createUnlockableShape({
                    locked: i > 0,
                    color: player.color,
                    componentId: `${player.id}-keysDiv-${i}-shape`,
                    shape: 'square',
                }))
                keysTracker.append(keysDiv)
            }
            return keysTracker
        },
        createActionTracker(player) {
            const actionTracker = document.createElement('div')
            actionTracker.className = 'actionTracker';
            actionTracker.id = `${player.id}-actionTracker`;
            for (let i = 0; i < unlockActionsToValue.length; i++) {
                const actionDiv = document.createElement('div');
                actionDiv.classList.add('actionDiv')
                // TODO center content better
                // Might need a innerText utility class
                // actionDiv.classList.add('actionDiv', 'centeredFlex')

                actionDiv.innerText = `Actiones ${unlockActionsToValue[i]}`
                actionDiv.append(this.createUnlockableShape({
                    locked: i > 0,
                    color: player.color,
                    componentId: `${player.id}-actionDiv-${i}-shape`,
                    shape: 'square',
                }))
                actionTracker.append(actionDiv)
            }
            return actionTracker;
        },
        createColorTracker(player) {
            const colorTracker = document.createElement('div')
            colorTracker.className = 'colorTracker';
            colorTracker.id = `${player.id}-colorTracker`;

            const colorBanner = document.createElement('div')
            colorBanner.id = 'boardComponentBanner';
            colorBanner.innerText = "Privilegium"
            colorTracker.append(colorBanner);

            for (let i = 0; i < unlockColorsToValue.length; i++) {
                const colorDiv = document.createElement('div');
                colorDiv.classList.add('colorDiv', 'centeredFlex')
                colorDiv.style.backgroundColor = `${unlockColorsToValue[i]}`
                colorDiv.append(this.createUnlockableShape({
                    locked: i > 0,
                    color: player.color,
                    componentId: `${player.id}-colorDiv-${i}-shape`,
                    shape: 'square',
                    isColors: true,
                }))
                colorTracker.append(colorDiv)
            }
            return colorTracker;
        },
        createMovesTracker(player) {
            const movesTracker = document.createElement('div')
            movesTracker.className = 'movesTracker';
            movesTracker.id = `${player.id}-movesTracker`;

            const movesBanner = document.createElement('div')
            movesBanner.id = 'boardComponentBanner';
            movesBanner.innerText = "Liber Sophiae"
            movesTracker.append(movesBanner);

            for (let i = 0; i < unlockMovementToValue.length; i++) {
                const movesDiv = document.createElement('div');
                movesDiv.className = 'movesDiv';
                movesDiv.innerText = `${unlockMovementToValue[i]}`
                movesDiv.append(this.createUnlockableShape({
                    locked: i > 0,
                    color: player.color,
                    componentId: `${player.id}-movesDiv-${i}-shape`,
                    shape: 'circle',
                }))
                movesTracker.append(movesDiv)
            }
            return movesTracker
        },
        createPurseTracker(player) {
            const purseTracker = document.createElement('div')
            purseTracker.className = 'purseTracker';
            purseTracker.id = `${player.id}-purseTracker`;
            for (let i = 0; i < unlockPurseToValue.length; i++) {
                const purseDiv = document.createElement('div');
                purseDiv.classList.add('purseDiv')

                purseDiv.innerText = `Resupply ${unlockPurseToValue[i]}`
                purseDiv.append(this.createUnlockableShape({
                    locked: i > 0,
                    color: player.color,
                    componentId: `${player.id}-purseDiv-${i}-shape`,
                    shape: 'square',
                }))
                purseTracker.append(purseDiv)
            }
            return purseTracker;
        },
        createUnlockableShape(props) {
            const { locked, color, componentId, shape, isColors } = props
            const unlockableShape = document.createElement('div')
            unlockableShape.className = isColors ? 'unlockableShapeColors' : 'unlockableShape';
            unlockableShape.id = componentId
            if (shape === 'circle') {
                unlockableShape.classList.add('circle')
            }
            if (locked) {
                const lockedShape = document.createElement('div')
                lockedShape.className = 'lockedShape';
                lockedShape.id = componentId + '-locked'
                lockedShape.style.backgroundColor = color
                unlockableShape.append(lockedShape)
                if (shape === 'circle') {
                    lockedShape.classList.add('circle')
                }
            }
            // need to add the subcomponnet if it's locked, need an unlockmethod
            // maybe rename to be shape agnostic
            return unlockableShape
        },
        createTokenTracker(player) {
            // eventually add some images for tokens (only need the eaten one)
            const tokenTracker = document.createElement('div');
            tokenTracker.className = 'tokenTracker';
            // Will eventually need a method to add to token tracker, once consumed
            const tokenHolder = document.createElement('div');
            tokenHolder.className = 'tokenHolder'
            tokenHolder.id = `tokenHolder-${player.id}`;
            tokenTracker.append(tokenHolder);
            return tokenTracker
        },
        updateSupplyAndBank(player) {
            const supplyTracker = document.getElementById(`supply-pieces-${player.id}`)
            const bankTracker = document.getElementById(`bank-pieces-${player.id}`)
            this.updateSupplyTracker(player, supplyTracker)
            this.updateBankTracker(player, bankTracker)
        },
        updateSupplyTracker(player, supplyTracker) {
            // This feels awful and hacky
            if (!supplyTracker) {
                supplyTracker = document.getElementById(`supply-pieces-${player.id}`)
            }
            supplyTracker.innerHTML = '';
            for (let i = 0; i < player.supplyCircles; i++) {
                supplyTracker.append(this.createSupplyOrBankPiece(true, player.color))
            }
            for (let i = 0; i < player.supplySquares; i++) {
                supplyTracker.append(this.createSupplyOrBankPiece(false, player.color))
            }
        },
        updateBankTracker(player, bankTracker) {
            if (!bankTracker) {
                bankTracker = document.getElementById(`bank-pieces-${player.id}`)
            }
            bankTracker.innerHTML = '';
            for (let i = 0; i < player.bankedCircles; i++) {
                bankTracker.append(this.createSupplyOrBankPiece(true, player.color))
            }
            for (let i = 0; i < player.bankedSquares; i++) {
                bankTracker.append(this.createSupplyOrBankPiece(false, player.color))
            }
        },
        createSupplyTracker(player) {
            const supplyDiv = createDivWithClassAndIdAndStyle(['supplyArea'], `supply-${player.id}`)
            const supplyBanner = createDivWithClassAndIdAndStyle(['banner'])
            supplyBanner.innerText = 'Supply';
            supplyDiv.append(supplyBanner)
            const supplyPieceTracker = createDivWithClassAndIdAndStyle(['pieceTracker'], `supply-pieces-${player.id}`)
            this.updateSupplyTracker(player, supplyPieceTracker);
            supplyDiv.append(supplyPieceTracker)
            // Supply contains tokens, bank does not
            return supplyDiv
        },
        createBankTracker(player) {
            // Just copy pasta from createSupplyTracker
            const bankDiv = createDivWithClassAndIdAndStyle(['bankArea'], `bank-${player.id}`)
            const bankBanner = createDivWithClassAndIdAndStyle(['banner'])
            bankBanner.innerText = 'Bank';
            bankDiv.append(bankBanner)
            const bankPieceTracker = createDivWithClassAndIdAndStyle(['pieceTracker'], `bank-pieces-${player.id}`)
            this.updateBankTracker(player, bankPieceTracker);
            bankDiv.append(bankPieceTracker)

            return bankDiv
        },
        createSupplyOrBankPiece(isCircle, color) {
            const piece = createDivWithClassAndIdAndStyle(['tinyPiece'], '',
                { backgroundColor: color })
            if (isCircle) {
                piece.classList.add('circle')
            }
            return piece
        },
    },
}

const turnTrackerController = {
    updateTurnTracker(player) {
        document.getElementById('turnTrackerPlayerName').innerText = player.name
        document.getElementById('turnTrackerPlayerColor').style.color = player.color
        document.getElementById('turnTrackerActions').innerText = player.currentActions
        // clear the turnTrackerAdditionalInformation as well
        document.getElementById('turnTrackerAdditionalInformation').innerHTML = ''
        this.resetTurnTimer()
    },
    updateTurnTrackerWithBumpInfo(props) {
        document.getElementById('turnTrackerAdditionalInformation').innerHTML = ''
        const {bumpedPlayer, bumpingPlayer, circlesToPlace, squaresToPlace} = props
 
        // Dev 3
        const bumpInfoDiv = createDivWithClassAndIdAndStyle(['bumpInfo'])
        let bumpInfoHTML = `<span style="color: ${bumpingPlayer.color}">${bumpingPlayer.name}</span> `
        bumpInfoHTML += `has displaced <span style="color: ${bumpedPlayer.color}">${bumpedPlayer.name}</span>. `
        bumpInfoHTML += `<span style="color: ${bumpedPlayer.color}">${bumpedPlayer.name}</span> has ${squaresToPlace}`
        if (squaresToPlace){
            bumpInfoHTML += ` square${squaresToPlace > 1 ? 's' : ''} ${circlesToPlace ? 'and' : ''}`
        }
        if (circlesToPlace) {
            bumpInfoHTML+= ' 1 circle '
        }
        bumpInfoHTML+= 'left to place on adjacent routes.'
        

        bumpInfoDiv.innerHTML = bumpInfoHTML;
        console.log(bumpInfoHTML)
        document.getElementById('turnTrackerAdditionalInformation').append(bumpInfoDiv)
    },
    resetTurnTimer() {
        // TODO
    }
}

const gameLogController = {
    initializeGameLog(history) {
        // optionally, we should load in history
        const collapseButton = document.createElement('button');
        collapseButton.innerText = 'Collapse Game Log';
        collapseButton.className = 'collapseButton';
        collapseButton.onclick = () => this.toggleGameLog(collapseButton)
        document.getElementById('gameLogContainer').append(collapseButton)
        this.isCollapsed = false;
    },
    toggleGameLog(collapseButton) {
        if (!this.isCollapsed) {
            document.getElementById('gameLog').classList.add('collapsedContainer')
            collapseButton.innerText = 'Expand Game Log'
        } else {
            document.getElementById('gameLog').classList.remove('collapsedContainer')
            collapseButton.innerText = 'Collapse Game Log'
        }
        this.isCollapsed = !this.isCollapsed
    },
    addTextToGameLog(text, player) {
        // player is an optional parameter
        // what we want to do is replace every instance of the player name with a span 
        // that wraps around them and contains their color
        // I think we can just do a string replace, we have full control over the inputs in this method
        const timestamp = (new Date()).toLocaleTimeString('en-US')
        if (player) {
            const playerNameSpan = `<span style="color: ${player.color}">${player.name}</span>`
            text = text.replaceAll('$PLAYER_NAME', playerNameSpan)
        }
        document.getElementById('gameLog').innerHTML += `${timestamp}: ${text}<br>`
        // TODO add to saved history

    }
}

class Player {
    constructor(color, name, startingPieces, id) {
        this.id = id;
        this.color = color;
        this.name = name;
        this.supplySquares = startingPieces;
        this.bankedSquares = STARTING_BANK - startingPieces;
        this.supplyCircles = 1;
        this.bankedCircles = 0;
        this.maxActions = 2; // Not to be confused with current actions
        this.currentActions = this.maxActions;
        this.currentPoints = 0;
        this.unlockedColors = ['grey'];
        this.maxMovement = 2;
        this.keys = 1;
        this.purse = 3;
        this.unlockArrayIndex = {
            actions: 0,
            purse: 0,
            maxMovement: 0,
            colors: 0,
            keys: 0,
        }
    }
}

const unlockActionsToValue = [2, 3, 3, 4, 4, 5];
const unlockPurseToValue = [3, 5, 7, 'All'];
const unlockMovementToValue = [2, 3, 4, 5];
const unlockColorsToValue = ['grey', 'orange', 'purple', 'black'];
const unlockKeysToValue = [1, 2, 2, 3, 4];

const start = () => {
    gameController.initializeGameStateAndUI(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS, TEST_BOARD_CONFIG_CITIES)
}


window.onload = start

// TEST VARIABLES 


// TEST, DELETE THIS TODO
const addPixelAtLocation = (x, y, isBig = false, color) => {
    const testElement = document.createElement('div')
    testElement.className = isBig ? 'testBigPixel' : 'testSinglePixel';
    testElement.id = 'TEST';
    testElement.style.left = x + 'px'
    testElement.style.top = y + 'px'
    if (color) {
        testElement.style.backgroundColor = color
    }
    document.getElementById('gameBoard').append(testElement)

    return testElement
}
