// let's start with a simple initiation of a route between two nodes and then move on to player class
// after I get that done I will move on to setting up a simple server

// will need a global state tracker - tracks which player is in control
// I think I'll expose an API that the UI can call

// Unlocks will come later


// in the long term might make sense to draw out the map with a canvas? ugh, I hate css

// Once I can get a player making legal moves and passing control add a second route and then move on to server

// Need top track current player. All commands must be passed to the game controller which will decide what happens
const gameController = {
    placeWorkerOnNode(nodeId, playerId, ) {
        // This should use the  boardController methods
    }
}


// The interface should NOT track state, just renders and creates buttons
const boardController = {
    // Will probably need to load this in from a file, 
    initializeUI() {
        this.board = document.getElementById('game-board');
        console.log(this.board)
        this.board.innerHTML = ''
        this.createCity('City One', [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']]);
        this.createRouteBox(3, 'testID')
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
                console.log('Clicked on node with id', nodeId)
                this.addPieceToRouteNode(nodeId, 'blue', 'square')
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

const playerUIController = {
    
}

const start = () => {
    boardController.initializeUI();
}

window.onload = start