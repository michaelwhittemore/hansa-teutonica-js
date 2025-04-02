// CONSTANTS
const STARTING_BANK = 15; // no clue if this is correct
const FIRST_PLAYER_SQUARES = 6;
const TEST_PLAYERS_NAMES = ['Alice', 'Bob']
const TEST_PLAYER_COLORS = ['red', 'blue']
const BUTTON_LIST = ['place', 'move', 'bump, resupply', 'capture', 'upgrade', 'token'];
const IS_HOTSEAT_MODE = true;
const USE_DEFAULT_CLICK_ACTIONS = true;
const APPROXIMATE_NODE_OFFSET = 30;

// location is a coordinates x, y offset from the origin in the top right
// Need to figure out minimum distance for a route
const TEST_BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3]],
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
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [900, 20]
    },
    'Zeta': {
        name: 'Zeta',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [30, 450],
        neighborRoutes: [['Alpha', 3]],
    },

};
const TEST_BOARD_CONFIG_CITIES_Straight = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['R-Beta', 4]],
        unlock: 'action',
        location: [20, 20]
    },
    'Beta': {
        name: 'Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['R-Alpha', 4]],

        unlock: 'purse',
        location: [550, 20]
    },
    'R-Alpha': {
        name: 'R-Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        unlock: 'action',
        location: [20, 400]
    },
    'R-Beta': {
        name: 'R-Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        unlock: 'purse',
        location: [550, 400]
    },
};


const PLAYER_FIELDS_TO_TEXT_MAP = {
    name: 'Name',
    color: 'Color',
    keys: 'Keys',
    unlockedColors: 'Unlocked Colors',
    supplySquares: 'Workers in Supply',
    bankedSquares: 'Workers in Bank',
    supplyCircles: 'Tradesmen (Circles) in Supply',
    bankedCircles: 'Tradesmen (Circles) in Bank',
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

const offSetCoordinatesForSize = (x, y, height = 60, width = 60) => {
    return ([x - (width / 2), y - (height / 2)]);
}

const offSetCoordinatesForGameBoard = (x, y) => {
    gameBoardDomRect = document.getElementById('gameBoard').getBoundingClientRect()
    return [x - gameBoardDomRect.x, y - gameBoardDomRect.y]
}
// IMPORTANT - NEED A HELPER FUNCTION TO OFFSET THE NODE SIZE (maybe it takes
//in the size of the element???)
const calculatePathBetweenElements = (element1, element2) => {
    drawLine(element1, element2)
    // We will always be going from element1 to element2
    // HOWEVER, we need to identify which edge of which we will be using

    const domRect1 = element1.getBoundingClientRect()
    const domRect2 = element2.getBoundingClientRect()

    // DEV2
    const xCenter1 = domRect1.x + (0.5 * domRect1.width)
    const yCenter1 = domRect1.y + (0.5 * domRect1.height)
    const xCenter2 = domRect2.x + (0.5 * domRect2.width)
    const yCenter2 = domRect2.y + (0.5 * domRect2.height)
    let xDelta = xCenter2 - xCenter1;
    let yDelta = yCenter2 - yCenter1;
    let xTarget1 = xCenter1;
    let xTarget2 = xCenter2;
    let yTarget1 = yCenter1;
    let yTarget2 = yCenter2;

    // TODO find Edge target and mark with red
    // first just do for Alpha --> Beta
    if (xDelta > 0) {
        xTarget1 = domRect1.x + domRect1.width;
        xTarget2 = domRect2.x;

    } else if (xDelta < 0) {
        xTarget2 = domRect2.x + domRect2.width;
        xTarget1 = domRect1.x;
    }
    if (yDelta > 0) {
        yTarget1 = domRect1.y + domRect1.height;
        yTarget2 = domRect2.y
    } else if (yDelta < 0) {
        yTarget2 = domRect2.y + domRect2.height;
        yTarget1 = domRect1.y
    }
    // DELETE BELOW EVENTIUALLUY, just prints magenta dots
    const offsetCoordinates1 = offSetCoordinatesForGameBoard(xTarget1, yTarget1);
    const offsetCoordinates2 = offSetCoordinatesForGameBoard(xTarget2, yTarget2);
    addPixelAtLocation(...offsetCoordinates1, true)
    addPixelAtLocation(...offsetCoordinates2, true)
    // List of things to do here:
    // 1. X Clean up a lot of the non-functional code and comments
    // 2. X Initalize the (x/y)targets of both city1 & city2 to coorespond to their centers
    // 3. X Follow the above example for x coordinates for city2 and then repeat for the negavtive slope
    // 4. X WRITE OUT (not copy pasta) the same thing for the y coordinates
    // 5. adjust the delta and starting locations accordingly (keep them for the momement)
    // 6. TODO figure out how to handle the issue of node offset (i.e. setting from the top left corner)
    // DEV 1
    // reevaluate deltas based on targetPoints
    xDelta = xTarget2 - xTarget1;
    yDelta = yTarget2 - yTarget1;
    // IMPORTANT - NEED A HELPER FUNCTION TO OFFSET THE NODE SIZE (maybe it takes
    //in the size of the element???)

    // maybe the special cases should just be the offests
    // IDEA: maybe add a processing method to node insertion to ensure we're targetting its center
    // We will ALWAYS start at xEdge1 and yEdge1. Negative deltas are totally ok!
    return {
        xDelta,
        yDelta,
        startX: xTarget1,
        startY: yTarget1,
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

    // TODO use offSetCoordinatesForGameBoard
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
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();

        inputHandlers.selectedAction = 'upgrade'
        actionInfoDiv.innerText = "Select a city corresponding to an upgrade."
    },
    handlePlaceButton() {
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();

        // May want to track state of action input (i.e have we selected an action, a location,
        // and additional information as needed)
        if (!inputHandlers.verifyPlayersTurn()) {
            return;
        }
        inputHandlers.selectedAction = 'place'
        actionInfoDiv.innerText = "Select a kind of piece to place and a location"

        const squareButton = document.createElement('button');
        squareButton.innerText = 'Square'
        squareButton.onclick = () => {
            inputHandlers.additionalInfo = 'square'
        }
        actionInfoDiv.append(squareButton);
        const circleButton = document.createElement('button');
        circleButton.innerText = 'Circle'
        circleButton.onclick = () => {
            inputHandlers.additionalInfo = 'circle'
        }
        actionInfoDiv.append(circleButton);

    },
    handleBumpButton() {
        console.warn('Bump is not yet implemented!')
        // TODO
    },
    handleCaptureCityButton() {
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();

        inputHandlers.selectedAction = 'capture';
        if (!inputHandlers.selectedLocation) {
            console.warn('No location selected')
            actionInfoDiv.innerText = 'Select a city to capture';
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
        inputHandlers.selectedAction = undefined;
        inputHandlers.selectedLocation = undefined;
        inputHandlers.additionalInfo = undefined;
        document.getElementById('actionInfo').innerHTML = ''
    },
    bindInputHandlers() {
        document.getElementById('place').onclick = this.handlePlaceButton;
        document.getElementById('bump').onclick = this.handleBumpButton;
        document.getElementById('resupply').onclick = this.handleResupplyButton;
        document.getElementById('capture').onclick = this.handleCaptureCityButton;
        document.getElementById('upgrade').onclick = this.handleUpgradeButton;

    },
    // TODO this doesn't work in all circumstances (like capturing a city)
    // Let's break action info and warning into two seperate components
    warnInvalidAction(warningText) {
        // Maybe i should clear the other area???
        // I think I should be modifying the span not resetting like this
        document.getElementById('actionInfo').innerHTML +=
            `<span class="warningText"> ${warningText}</span>`;
    },
    routeNodeClickHandler(nodeId) {
        // Remember that we can use this for place, or move (both selecting FROM and TO), and for bumping
        if (!inputHandlers.selectedAction) {
            if (USE_DEFAULT_CLICK_ACTIONS) {
                inputHandlers.selectedAction = 'place';
                inputHandlers.additionalInfo = 'square'
            } else {
                // TODO warn that nothing was selected
                return;
            }

        };
        if (!inputHandlers.additionalInfo) {
            if (USE_DEFAULT_CLICK_ACTIONS) {
                inputHandlers.additionalInfo = 'square';
            } else {
                // TODO warn that no shape was selected (or maybe dependant on action??)
                return;
            }
        }
        // Happy path for place move - leave checking the turn and availble pieces and freeness of the node to the game controller
        if (inputHandlers.selectedAction === 'place' && isShape(inputHandlers.additionalInfo)) {
            // playerName is currently the selected player for hotseat
            // in onlinePlay it will be something else
            let playerId = undefined
            if (!IS_HOTSEAT_MODE) {
                // get the player name from localstorage
            }
            gameController.placeWorkerOnNode(nodeId, inputHandlers.additionalInfo, playerId);
        }
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
        inputHandlers.clearAllActionSelection();
        player.currentActions -= 1;
        if (player.currentActions === 0) {
            this.advanceTurn(player);
        }
        turnTrackerController.updateTurnTracker(this.getActivePlayer())
        playerInformationAndBoardController.componentBuilders.updateInfoDumpOnAll(this.playerArray)
        this.playerArray.forEach(player => {
            playerInformationAndBoardController.componentBuilders.updateSupplyAndBank(player)
        })
    },
    placeWorkerOnNode(nodeId, shape, playerId) {
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
        // FIX THIS, need route ID
        const routeId = nodeId.substring(0, nodeId.length - 2);
        if (this.routeStorageObject[routeId]?.routeNodes[nodeId]?.occupied) {
            console.warn('That route node is already occupied!')
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction('That route node is already occupied!')
            return
        }
        player[playerShapeKey] -= 1;
        this.routeStorageObject[routeId].routeNodes[nodeId] = {
            occupied: true,
            shape,
            color: player.color,
            playerId,
        }
        boardController.addPieceToRouteNode(nodeId, player.color, shape);
        gameLogController.addTextToGameLog(`$PLAYER_NAME placed a ${shape} on ${nodeId}`, player)
        this.resolveAction(player)
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
        // DEV!!!
        console.warn(routeProperties.id)
        const { length, id, element1, element2 } = routeProperties
        let { xDelta, yDelta, startX, startY } = calculatePathBetweenElements(element1, element2)

        const xIncrement = xDelta / length
        const yIncrement = yDelta / length

        for (let i = 0; i < length; i++) {
            const routeNode = document.createElement('button');
            routeNode.className = 'routeNode';
            const nodeId = `${id}-${i}`;
            routeNode.id = nodeId;
            routeNode.onclick = () => {
                inputHandlers.routeNodeClickHandler(nodeId)
            }

            let [xCoordinate, yCoordinate] = offSetCoordinatesForGameBoard(startX + (xIncrement * i),
                startY + (yIncrement * i))
            if (xIncrement > 0) {
                xCoordinate += APPROXIMATE_NODE_OFFSET;
            } else if (xIncrement < 0){
                xCoordinate -= APPROXIMATE_NODE_OFFSET;
            }
            if (yIncrement > 0){
                yCoordinate += APPROXIMATE_NODE_OFFSET;
            } else if (yIncrement < 0)
                yCoordinate -= APPROXIMATE_NODE_OFFSET;

            let [x, y] = offSetCoordinatesForSize(xCoordinate, yCoordinate)
            // Final offset magntidue will depend on the delta. maybe we collapse it into APPROXIMATE_NODE_OFFSET

            routeNode.style.left = x + 'px';
            routeNode.style.top = y + 'px';

            this.board.append(routeNode)
        }
        // debugger;
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

        playerInfoBoard.append(this.componentBuilders.createInfoDump(player))
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
        createInfoDump(player) {
            const infoDumpArea = document.createElement('div')
            infoDumpArea.className = 'infoDumpArea';
            infoDumpArea.id = `infoDumpArea-${player.id}`
            infoDumpArea.innerText = ''
            // I'm not gonna map these to plain text as i'm going to delete them later anyway
            const dumpFields = ['supplySquares', 'bankedSquares', 'supplyCircles', 'bankedCircles', 'currentPoints', 'tokens',];
            dumpFields.forEach(dumpKey => {
                infoDumpArea.innerText += `${dumpKey}: ${player[dumpKey]}, `
            })
            return infoDumpArea
        },
        updateInfoDumpOnAll(playerArray) {
            // this really shouldn't be in the component BUILDER
            playerArray.forEach(player => {
                const infoDumpArea = document.getElementById(`infoDumpArea-${player.id}`)
                infoDumpArea.innerText = ''
                // should be deleted soon don't worry about non-dry code
                const dumpFields = ['supplySquares', 'bankedSquares', 'supplyCircles', 'bankedCircles', 'currentPoints', 'tokens',];
                dumpFields.forEach(dumpKey => {
                    infoDumpArea.innerText += `${dumpKey}: ${player[dumpKey]}, `
                })
            })
        }
    },
}

const turnTrackerController = {
    updateTurnTracker(player) {
        document.getElementById('turnTrackerPlayerName').innerText = player.name
        document.getElementById('turnTrackerPlayerColor').style.color = player.color
        document.getElementById('turnTrackerActions').innerText = player.currentActions

        this.resetTurnTimer()
    },
    turnTrackerAdditionalInformation(props) {
        // TODO
        // I think we will need an area for things like bumping or placing new tokens 
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
    // gameController.initializeGameStateAndUI(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS, 
    //     TEST_BOARD_CONFIG_CITIES_Straight)

}


window.onload = start

// TEST VARIABLES 

const testCity = {
    "cityName": "Test City A",
    "occupants": [1, 0, 1, 1, 0, 1, 0, 0, 3, 3, 3, 3, 1, 3],
    "openSpotIndex": 2,
    "spotArray": [
        [
            "square",
            "grey"
        ],
        [
            "circle",
            "grey"
        ],
        [
            "square",
            "orange"
        ]
    ]
}

const testCity2 = {
    "cityName": "Test City B",
    "occupants": [1, 0, 0, 1],
    bonusSpotOccupantId: 1
}

// TEST, DELETE THIS TODO
const addPixelAtLocation = (x, y, isBig = false) => {
    const testElement = document.createElement('div')
    testElement.className = isBig ? 'testBigPixel' : 'testSinglePixel';
    testElement.id = 'TEST';
    testElement.style.left = x + 'px'
    testElement.style.top = y + 'px'
    document.getElementById('gameBoard').append(testElement)

    return testElement
}
