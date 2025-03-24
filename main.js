// CURRENT TODO LIST!!!!!!:
/* 
    XXXXX @Add a action calirifcation area below the button bar (i.e. select, square vs circle,
        warn when trying to take an illegal action, select token via drop down) 
    XXXX @Add some extra routes and cities to play with 
    @create the click handlers for move and replace
    @Create a globalized process turn method (checks player actions and legaility) and bumps the action/turn
    @Handler should include the Player Information updating
    @Add Button click handlers when initalizing the game
    @Add Some padding to the components
    @Update player Bank and supply to use circles and squares
    @Spin up a simple node server and move these to modules
    @Make the board and the player information area collapsable
    @Add the ability tp 
    @Add a turn timer to the turn tracker
    @Create a list of stretch goals
*/

// I can probably fix my orientation issue by making the gameboard scrollable and hard coding in coordinates

// MAYBE CONVERT TO TYPESCRIPT???

// Very long term - add an end game calculator, undo action button, resume game, landing page, keyboard short cuts

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
    currentActions:'Actions Remaining', 
    currentPoints: 'Current Non-Endgame Points', 
    maxMovement: 'Maximum Piece Movement',
}

const isShape = (inputString) => inputString  === 'square' || inputString === 'circle';
// Does this *need* to be an object? Maybe refactor once I do modules (although maybe this
// would benefit from being able to track other input info in order to construct a full move)
const inputHandlers = {
    verifyPlayersTurn(){
        // if not true will update action info with 'It isn't your turn'
        // pretend this checks if it's the correct player's turn 
        return true;
    },

    handlePlace(){
        const actionInfoDiv = document.getElementById('actionInfo');
        inputHandlers.clearAllActionSelection();

        // May want to track state of action input (i.e have we selected an action, a location,
        // and additonal information as needed)
        if (!inputHandlers.verifyPlayersTurn()){
            return;
        }
        inputHandlers.selectedAction = 'place'
        // Need to heighlight the piece to go to

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
    clearAllActionSelection(){
        inputHandlers.selectedAction = undefined;
        inputHandlers.selectedLocation = undefined;
        inputHandlers.additionalInfo = undefined;
        document.getElementById('actionInfo').innerHTML= ''
    },
    bindInputHandlers(){
        document.getElementById('place').onclick = this.handlePlace;
    },
    warnInvalidAction(warningText){
        document.getElementById('actionInfo').innerHTML += 
            `<span class="warningText"> ${warningText}</span>`;
    },
    routeNodeClickHandler(nodeId){
        // Remember that we can use this for place, or move (both slecting FROM and TO), and for bumping
        if (!inputHandlers.selectedAction){
            console.warn('No selected action at that location')
        };
        if (!inputHandlers.additionalInfo) {
            console.warn('NO additionalInfo, (this may be accetable for bump)')
        }
        // Happy path for place move - leave checking the turn and availble pieces and freeness of the node to the game controller
        if (inputHandlers.selectedAction === 'place' && isShape(inputHandlers.additionalInfo)){
            // playerName is currently the selected player for hotseat
            // in onlinePlay it will be something else
            let playerId = undefined
            if (!IS_HOTSEAT_MODE){
                // get the player name from localstorage
            }
            gameController.placeWorkerOnNode(nodeId, inputHandlers.additionalInfo, playerId);
        }
        // WIll need to pass this into game controller once all the validation happens
        // Maybe the game controller will handle the validation?
        // If it's not your turn we don't even bother the game controller
        // gameController.placeWorkerOnNode(nodeId)
        // This will do stuff dynamically based on the other turn selection information
    }
}

const gameController = {
    initializeGameState(playerNames, playerColors) {
        // inputs are arrays
        // let's just use turn order for IDs
        this.playerArray = []
        for (let i = 0; i < playerNames.length; i++){
            const player = new Player(playerColors[i], playerNames[i], FIRST_PLAYER_SQUARES + i);
            this.playerArray.push(player)
        }
        // NEED AN ADVANCE turn method
        this.currentTurn = 0;
        playerInformationController.initializePlayerUI(this.playerArray)
        this.routeNodeStorageObject = {}
        inputHandlers.bindInputHandlers()
    },
    resumeGame(properties) {
        //TODO
    },
    getActivePlayer(){
        return this.playerArray[this.currentTurn % this.playerArray.length]
    },
    getPlayerById(){
        // TODO, only used for online play I think
    },
    resolveAction(player){
        // TODO
        // 1. SUBTRACT PLAYER ACTIONS
        // 2. IF NEEDED, ADVANCE THE TURN AND MOVE CURRENT PLAYER
        // 3. UPDATE PLAYER TRACKER FIELD
        // 4. UPDATE PLAYER INFO
    },
    placeWorkerOnNode(nodeId, shape, playerId) {
        console.log('in placeWorkerOnNode with nodeId', nodeId)
        // DEV
        let player;
        if(IS_HOTSEAT_MODE){
            player = this.getActivePlayer()
        } else {
            // TODO, check that the playerId who made the request is the active player
        }
        // Validate that the player has enough supply and that the node is unoccupied
        const playerShapeKey = shape === 'square' ? 'supplySquares' : 'supplyCircles';
        if (player[playerShapeKey] < 1){
            console.warn(`Not enough ${shape}s in your supply`)
            inputHandlers.warnInvalidAction(`Not enough ${shape}s in your supply!`)
            // TODO This won't work as we're clearing the warning area
            inputHandlers.clearAllActionSelection();
            return
        }
        if (this.routeNodeStorageObject[nodeId].occupied){
            console.warn('That route node is already occupied!')
            // TODO This won't work as we're clearing the warning area
            inputHandlers.warnInvalidAction('That route node is already occupied!')
            inputHandlers.clearAllActionSelection();
            return
        }
        player[playerShapeKey] -= 1;
        boardController.addPieceToRouteNode(nodeId, player.color, shape)
    },

}


// The interface should NOT track state, just renders and creates buttons
const boardController = {
    // Will probably need to load this in from a file, 
    initializeUI() {
        this.board = document.getElementById('gameBoard');
        this.board.innerHTML = ''
        this.createCity('City One', [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']]);
        this.createRouteBox(3, 'testID-a')
        this.createCity('City Two', [['square', 'grey'], ['square', 'grey']]);
        this.createRouteBox(4, 'testID-b')
        this.createCity('City Three', [['square', 'grey'], ['circle', 'purple']]);

    },
    createCity(name, spotArray, location) {
        // spotArray is a 2d text array with either circle or square and color
        const cityDiv = document.createElement('div');
        cityDiv.className = 'city'
        // We assume all cities have unique names as identifers 
        cityDiv.id = name
        // the name should be in its own div
        cityDiv.innerText = `${name}`
        spotArray.forEach(spotInfo => {
            const citySpotDiv = document.createElement('div');
            citySpotDiv.className = spotInfo[0];
            // these will eventually need piece spots too
            // Might make sense to have a color map
            citySpotDiv.style.backgroundColor = spotInfo[1]
            cityDiv.append(citySpotDiv)
        })
        // Eventually will need to add to the gameboard instead of the body
        this.board.append(cityDiv)
    },
    createRouteBox(length, id, location) {
        const routeBoxDiv = document.createElement('div');
        routeBoxDiv.className = 'routeBox';
        // iterate over the length and create nodes (which need a piece sub section)
        for (let i = 0; i < length; i++) {
            const routeNode = document.createElement('button');
            routeNode.className = 'routeNode';
            const nodeId = `${id}-${i}`;
            routeNode.id = nodeId;
            routeNode.onclick = (event) => {
                // this.addPieceToRouteNode(nodeId, 'blue', 'square')
                // Maybe pass in a player based on local information??
                // gameController.placeWorkerOnNode(nodeId)
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
        playerPieceDiv.className = shape;
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
    initializePlayerUI(playerArray){
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
    turnTrackerHTMLBuilder(player){
        const { name, color, currentActions } = player
        return (`It's currently <span style="color:${color}">${name}'s</span> turn. They have ${currentActions} actions remaining.`)
    },
    createPlayerBox(player){
        const playerBoxDiv = document.createElement('div');
        playerBoxDiv.className = 'playerBox';
        playerBoxDiv.style.color = player.color;
        
        Object.keys(PLAYER_FIELDS_TO_TEXT_MAP).forEach(field => {
            const textDiv = document.createElement('div');
            textDiv.innerHTML = `${PLAYER_FIELDS_TO_TEXT_MAP[field]}: 
                <span id="${player[field]}">${player[field]}</span>`;
            playerBoxDiv.append(textDiv)
        })
        return playerBoxDiv
        // would be nice to evenually represent the bank and supply more visually
    },
    updatePlayerBox(player){
        // TODO
    }
}
// NEED A SERPATE CONTROLLER AREA (with move, resupply, place, upgrade, capture, bump, use token)

// Do we need a seperate click handler?????

// I think end game points will be calculated much later
// Need player fields:
/**
 * Piece color
 * Points (may also need to be tracked by board state)
 * Bank value (both kinds)
 * Supply value (both kinds)
 * Actions used (i.e. as part of the turn)
 * Actions unlocked
 * Keys Unlocked
 * Colors unlocked
 * Purse value
 * Move value (the number of units that can be shifted on the board)
 * Number of tokens (or whatever those little bonus pieces are called) both used and avaible
 * playerId?
 * Name?
 */
// Should the game controller have a reference to the players? I want to say yes, it should call their methods

class Player {
    constructor(color, name, startingPieces) {
        this.color = color;
        this.name = name;
        this.supplySquares = startingPieces;
        this.bankedSquares = STARTING_BANK - startingPieces;
        this.supplyCircles = 1;
        this.bankedCircles = 0;
        this.maxActions = 2; // Not to be confused with current actions
        this.currentActions = this.maxActions;
        this.currentPoints = 0;
        this.unlockedColors = ['grey' ];// need a refernce map
        this.maxMovement = 2;
        this.keys = 1;
        // Might have some other properties, but can deal with those later
    }

}


const start = () => {
    boardController.initializeUI();
    gameController.initializeGameState(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS)
}

window.onload = start