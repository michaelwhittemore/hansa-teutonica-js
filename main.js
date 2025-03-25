// CURRENT TODO LIST!!!!!!:
/* 
    XXXXX @Add a action clarification area below the button bar (i.e. select, square vs circle,
        warn when trying to take an illegal action, select token via drop down) 
    XXXX @Add some extra routes and cities to play with 
    XXX@Create the click handlers for place and capture and resupply
    XXX@Create a globalized process turn method (checks player actions and legality) and bumps the action/turn
    @And onclick buttons to cities and bind them like routes
    XXX @Handler should include the Player Information updating
    XXX @Add Button click handlers when initializing the game
    XXX @Add Some margins to the components
    @Capture cities
    @Fix the warning text by creating two seperate areas
    XXXX @NEED TO COllapse routeNodeStorageObject & routeStorageObject into a single object
    @Move some of the gamecontroller copy pasta into it's own methods
    @Update player Bank and supply to use circles and squares
    @Spin up a simple node server and move these to modules
    @Make the board and the player information area collapsable
    @Add a turn timer to the turn tracker
    @Add a collapsable game log
    @Attempt to 
    @Create a list of stretch goals
*/

// I can probably fix my orientation issue by making the gameboard scrollable and hard coding in coordinates


// _________________------------------------------------
// Very long term - add an end game calculator, undo action button, resume game, landing page, keyboard short cuts,
// mouse over text for player fields, turn log (just some text after resolve turn), make collapsable, refactor
// some methods to be seperate helper functions, convert to TS

// server to track plays (maybe even move logic there???)
// Will eventually need to save state to local storage, maybe have a landing page with a "resume" button

// in the long term might make sense to draw out the map with a canvas? ugh, I hate css

// Have players alternate turns on one board until I implement a server to handle cross window gameplay

// CONSTANTS
const STARTING_BANK = 15; // no clue if this is correct
const FIRST_PLAYER_SQUARES = 6;
const TEST_PLAYERS_NAMES = ['Alice', 'Bob']
const TEST_PLAYER_COLORS = ['red', 'blue']
const BUTTON_LIST = ['place', 'move', 'bump, resupply', 'capture', 'upgrade', 'token'];
const IS_HOTSEAT_MODE = true;

const TEST_BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3]],
        unlock: 'action',
    },
    'Beta': {
        name: 'Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['Gamma', 4]],
        unlock: 'purse',
    },
    'Gamma': {
        name: 'Gamma',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        unlock: 'unlockedColors',
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

const isShape = (inputString) => inputString === 'square' || inputString === 'circle';

const inputHandlers = {
    verifyPlayersTurn() {
        // NEED TO ADD TO ALL BUTTON HANDLERS
        // THE LOGIC IS THAT IN NON-HOTSEAT PLAY THE INPUTHANDLER SHOULD TELL YOU TO WAIT
        // IT SHOULDN'T BE THE gameController's responsbility (I think??)

        // if not true will update action info with 'It isn't your turn'
        // pretend this checks if it's the correct player's turn 
        return true;
    },

    handlePlaceButton() {
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();

        // May want to track state of action input (i.e have we selected an action, a location,
        // and additonal information as needed)
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
        console.warn('capture city incoming')
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();
        // TODO
        // check if we've selected a city
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
        console.warn('resupplying')
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
            console.warn('No selected action at that location')
            console.warn('Defaulting to place square')
            // WE MAY WANT TO CHANGE DEFAULTS
            inputHandlers.selectedAction = 'place';
            inputHandlers.additionalInfo = 'square'
        };
        if (!inputHandlers.additionalInfo) {
            console.warn('NO additionalInfo, (this may be accetable for bump)')
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
        console.log('clicked on city', cityId)
        if (!inputHandlers.selectedAction) {
            inputHandlers.selectedLocation = cityId;
            console.warn('No selected action at that location')
            console.warn('Defaulting to capturing city')
            // WE MAY WANT TO CHANGE DEFAULTS
            inputHandlers.selectedAction = 'capture';
        };
        if (inputHandlers.selectedAction === 'capture') {
            // Might need to pass in player ID
            gameController.captureCity(cityId, undefined)
        }

    }
}

const gameController = {
    initializeGameState(playerNames, playerColors) {
        // let's just use turn order for IDs
        this.playerArray = []
        for (let i = 0; i < playerNames.length; i++) {
            const player = new Player(playerColors[i], playerNames[i], FIRST_PLAYER_SQUARES + i, i);
            this.playerArray.push(player)
        }
        this.currentTurn = 0;
        playerInformationController.initializePlayerUI(this.playerArray)
        this.routeStorageObject = {}
        this.cityStorageObject = {};
        inputHandlers.bindInputHandlers()
        // This make certain assumptions about the ordering cities, when we get location based this won't be an issue
        boardController.initializeUI();

        Object.keys(TEST_BOARD_CONFIG_CITIES).forEach(cityKey => {
            const city = TEST_BOARD_CONFIG_CITIES[cityKey]
            boardController.createCity({ ...city })
            this.cityStorageObject[cityKey] = {
                cityName: cityKey, //techincally kinda useless
                occupants: [],
                openSpotIndex: 0,
                spotArray: city.spotArray,
                bonusSpot: undefined,
            }
            if (city.neighborRoutes) {
                const neighborCityName = city.neighborRoutes[0][0]
                const length = city.neighborRoutes[0][1]
                const routeId = `${city.name}-${neighborCityName}`
                boardController.createRouteBox(city.neighborRoutes[0][1], routeId)

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
        playerInformationController.updateTurnTracker(this.getActivePlayer())
        lastPlayer.currentActions = lastPlayer.maxActions;
        // the last player's actions aren't being updated on player box
    },
    resolveAction(player) {
        inputHandlers.clearAllActionSelection();
        player.currentActions -= 1;
        if (player.currentActions === 0) {
            this.advanceTurn(player);
        }
        playerInformationController.updateTurnTracker(this.getActivePlayer())
        playerInformationController.updateAllPlayersInfo(this.playerArray)
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
        if (player.purse === 'All') {
            player.supplyCircles += player.bankedCircles;
            player.bankedCircles = 0;
            player.supplySquares += player.bankedSquares;
            player.bankedSquares = 0;
        } else {
            let restocks = player.purse;
            const resuppliedCircles = Math.min(player.bankedCircles, restocks);
            player.supplyCircles += resuppliedCircles;
            player.bankedCircles -= resuppliedCircles;
            restocks -= resuppliedCircles;
            const resuppliedSquares = Math.min(player.bankedSquares, restocks);
            player.supplySquares += resuppliedSquares;
            player.bankedSquares -= resuppliedSquares;
            console.log(`${player.name} resupplied ${resuppliedCircles} circles and ${resuppliedSquares} squares.`);
        }
        this.resolveAction(player)
        // eventually should chose circles vs squares, right now default to all circles, then square
    },
    captureCity(cityName, playerId) {
        console.warn(`${playerId} is trying to capture ${cityName}`)
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

        // DEV 
        const city = this.cityStorageObject[cityName]
        console.log(city)

        const routeCheckOutcome = this.checkIfPlayerControlsARoute(playerId, cityName)
        // if (!routeCheckOutcome){
        //     console.warn('You do not have a completed route')
        //     inputHandlers.clearAllActionSelection();
        //     inputHandlers.warnInvalidAction('You do not have a completed route');
        //     return;
        // };
        if (player.currentActions === 0){
            // I don't think we should reach here???
            console.error('You don\'t have enough actions, how did you even get here? The turn was supposed to advance!')   
            return;
        }
        if (city.openSpotIndex === city.spotArray){
            console.warn(`The city of ${city.cityName} is already full.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`The city of ${city.cityName} is already full.`);
            return;
        }
        const [targetShape, targetColor] = city.spotArray[city.openSpotIndex]
        if (!player.unlockedColors.includes(targetColor)){
            console.warn(`You haven't unlocked ${targetColor}.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You haven't unlocked ${targetColor}.`);
            return
        }
        if (routeCheckOutcome[targetShape] === 0){
            console.warn(`You don't have a ${targetShape} in your route.`)
            inputHandlers.clearAllActionSelection();
            inputHandlers.warnInvalidAction(`You don't have a ${targetShape} in your route.`);
            return
        }
        console.log('Everything looks good, capturing city now.')
        /* 
        5. If everything is OK:
        6. Take one of the player pieces on route and add it to the city
        6.5 Clear all existing route nodes in that route
        7. Update city info (including openSpotIndex)
        8. Update city UI
        9. Update player bank 
        10. Points check (optional, maybe later)
        11. Standard end of action resolution
        */
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
    }

}


// The interface should NOT track state, just renders and creates buttons
const boardController = {
    // Will probably need to load this in from a file, 
    initializeUI() {
        this.board = document.getElementById('gameBoard');
        this.board.innerHTML = ''
        // The rest of the building is done by the game controller as it loads the board data
    },
    createCity(cityInformation) {
        const { name, spotArray, unlock, location } = cityInformation;
        const cityDiv = document.createElement('button');
        cityDiv.className = 'city'
        // We assume all cities have unique names as identifers 
        cityDiv.id = name

        cityDiv.innerText = `${name} \n Unlocks ${unlock}`;
        spotArray.forEach(spotInfo => {
            const citySpotDiv = document.createElement('div');
            citySpotDiv.className = `big-${spotInfo[0]}`;
            citySpotDiv.style.backgroundColor = spotInfo[1]
            cityDiv.append(citySpotDiv)
        })
        cityDiv.onclick = () => {
            inputHandlers.cityClickHandler(name)
        }
        this.board.append(cityDiv)
    },
    createRouteBox(length, id, location) {
        const routeBoxDiv = document.createElement('div');
        routeBoxDiv.className = 'routeBox';
        for (let i = 0; i < length; i++) {
            const routeNode = document.createElement('button');
            routeNode.className = 'routeNode';
            const nodeId = `${id}-${i}`;
            routeNode.id = nodeId;
            routeNode.onclick = (event) => {
                inputHandlers.routeNodeClickHandler(nodeId)
            }
            routeBoxDiv.append(routeNode)
        }
        this.board.append(routeBoxDiv)
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
    }
}

// Any on click will need to check if it's the player's turn (or they have priority based on a bump)
const playerInformationController = {
    initializePlayerUI(playerArray) {
        const playerAreaDiv = document.getElementById('playerArea');
        playerAreaDiv.innerHTML = '';
        const turnTrackerHTML = this.turnTrackerHTMLBuilder(playerArray[0]);
        const turnTrackerDiv = document.createElement('div');
        turnTrackerDiv.id = 'turnTracker'
        turnTrackerDiv.innerHTML = turnTrackerHTML;
        playerAreaDiv.append(turnTrackerDiv)
        playerArray.forEach(player => {
            playerAreaDiv.append(this.createPlayerBox(player));
        })
    },
    updateTurnTracker(player) {
        document.getElementById('turnTracker').innerHTML = this.turnTrackerHTMLBuilder(player)
    },
    turnTrackerHTMLBuilder(player) {
        const { name, color, currentActions } = player
        return (`It's currently <span style="color:${color}">${name}'s</span> turn. They have ${currentActions} actions remaining.`)
    },
    createPlayerBox(player) {
        const playerBoxDiv = document.createElement('div');
        playerBoxDiv.className = 'playerBox';
        playerBoxDiv.style.color = player.color;
        playerBoxDiv.id = player.id;

        Object.keys(PLAYER_FIELDS_TO_TEXT_MAP).forEach(field => {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = `${PLAYER_FIELDS_TO_TEXT_MAP[field]}: 
                <span id="${player.id}-${field}">${player[field]}</span>`;
            playerBoxDiv.append(textDiv)
        })
        return playerBoxDiv
        // would be nice to evenually represent the bank and supply more visually
    },
    updatePlayerBox(player) {
        Object.keys(PLAYER_FIELDS_TO_TEXT_MAP).forEach(field => {
            const fieldSpan = document.getElementById(`${player.id}-${field}`);
            fieldSpan.innerText = player[field]
        })
    },
    updateAllPlayersInfo(players) {
        players.forEach(player => {
            this.updatePlayerBox(player)
        })
    }
}
// NEED A SERPATE CONTROLLER AREA (with move, resupply, place, upgrade, capture, bump, use token)

// Do we need a seperate click handler?????

// I think end game points will be calculated much later
// Need player fields:
/**
 * Points (may also need to be tracked by board state)
 * Number of tokens (or whatever those little bonus pieces are called) both used and avaible

 */
// Should the game controller have a reference to the players? I want to say yes, it should call their methods

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
        this.unlockedColors = ['grey'];// need a refernce map
        this.maxMovement = 2;
        this.keys = 1;
        this.purse = 3;
    }

}


const start = () => {
    boardController.initializeUI();
    gameController.initializeGameState(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS)
}

window.onload = start