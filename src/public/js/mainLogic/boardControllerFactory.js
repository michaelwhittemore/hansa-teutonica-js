import { logicBundle } from "../helpers/logicBundle.js";
import { createDivWithClassAndIdAndStyle, calculatePathBetweenElements, offSetCoordinatesForSize,
    } from "../helpers/helpers.js";
import { TOKEN_READABLE_NAMES } from "../helpers/constants.js";

const translateElement = (myElement, x, y) => {
    // dev
    // TODO!! - move this to the helper file (maybe even create a new one)
    // also rename `myElement`
    const currentBounds = myElement.getBoundingClientRect()
    const xTarget = x - currentBounds.x
    const yTarget = y - currentBounds.y
    console.log(xTarget, yTarget)
    myElement.style.transform = ` translate(${xTarget}px, ${yTarget}px)`
    
    console.log(myElement.getBoundingClientRect())
}

export const boardControllerFactory = () => {
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
                const pointPieceContainer = createDivWithClassAndIdAndStyle(['pointPieceContainer'], `points-${i}`)
                pointPieceContainer.innerText = i;
                pointTracker.append(pointPieceContainer);
            }
            playerArray.forEach(player => {
                this.updatePoints(0, player.color)
            })
        },
        updatePoints(pointTarget, playerColor) {
            // would be nice to eventually remove the number, but this works for now
            // TODO I think I can make the number it's own div and make it absolute (maybe need to play with z index)
            document.getElementById(`point-tracker-${playerColor}`)?.remove()
            const pointTrackerPiece = createDivWithClassAndIdAndStyle(['pointTrackerPiece'], `point-tracker-${playerColor}`,
                { backgroundColor: playerColor })
            document.getElementById(`points-${pointTarget}`).append(pointTrackerPiece)
        },
        createCity(cityInformation) {
            // dev
            const { name, spotArray, unlock, location, freePoint } = cityInformation;
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
    
            cityPieceAreaDiv.append(this.createCityBonusSpotArea(name))
            for (let i = 0; i < spotArray.length; i++) {
                const spotNumber = i;
                const spotInfo = spotArray[i]
                const citySpotDiv = createDivWithClassAndIdAndStyle([`big-${spotInfo[0]}`, 'cityPieceHolder'],
                    `${name}-${i}`, { backgroundColor: spotInfo[1] });
    
                citySpotDiv.onclick = (event) => {
                    // We prevent the event from also bubbling up to the city click handler
                    event.stopPropagation();
                    logicBundle.inputHandlers.citySpotClickHandler(spotNumber, name)
                };
                if (i === 0 && freePoint) {
                    const freePointDiv = createDivWithClassAndIdAndStyle(['freePoint', 'centeredFlex'], `freePoint-${name}`);
                    freePointDiv.innerText = '1'
                    citySpotDiv.append(freePointDiv)
                }
                cityPieceAreaDiv.append(citySpotDiv)
            }
            
            cityDiv.onclick = () => {
                logicBundle.inputHandlers.cityClickHandler(name)
            }
            this.board.append(cityDiv)
            // The transform needs to happen afterwards as it calculates based on the current position with 
            // getBoundingClientRect()
            translateElement(cityDiv, location[0], location[1])

            return cityDiv
        },
        createCityBonusSpotArea(cityName) {
            const bonusBox = createDivWithClassAndIdAndStyle(['big-square', 'bonusBox', 'centeredFlex'], `bonus-${cityName}`)
            bonusBox.innerText = 'Bonus trading posts'
            return bonusBox;
        },
        addBonusPieceToCity(city, color, shape, numberOfPiecesAlreadyThere) {
            const bonusBox = document.getElementById(`bonus-${city.cityName}`)
            const bonusPiece = createDivWithClassAndIdAndStyle([shape, `bonus-piece-${city.cityName}`], '', { backgroundColor: color })
            let size = 25;
            if (numberOfPiecesAlreadyThere === 0) {
                // We only clear if there's no pieces, just the text
                bonusBox.innerText = ''
                size = 45;
            }
    
            // HTMLCollection do not have iterable methods
            bonusBox.append(bonusPiece)
            const allPieces = document.getElementsByClassName(`bonus-piece-${city.cityName}`)
    
            for (let i = 0; i < allPieces.length; i++) {
                allPieces[i].style.height = size + 'px'
                allPieces[i].style.width = size + 'px'
            }
        },
        createRouteAndTokenFromLocations(routeProperties) {
            // dev
            const { length, id, element1, element2, tokenDirection, isStartingToken, tokenValue } = routeProperties
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
                    logicBundle.inputHandlers.routeNodeClickHandler(nodeId)
                }
    
                let [xCoordinate, yCoordinate] = [startX + (xIncrement * (i + 1)),
                    startY + (yIncrement * (i + 1))]
    
                let [x, y] = offSetCoordinatesForSize(xCoordinate, yCoordinate)
    
                // routeNode.style.left = x + 'px';
                // routeNode.style.top = y + 'px';
    
                this.board.append(routeNode)
                translateElement(routeNode, x, y)
            }
            let [xToken, yToken] = [(startX + (xDelta / 2),
                startY + (yDelta / 2))];
            this.createBoardTokenHolder([xToken, yToken], id, tokenDirection, isStartingToken, tokenValue)
        },
        clearTokenFromRouteAndHide(routeId) {
            const tokenDiv = document.getElementById(`token-${routeId}`);
            tokenDiv.style.backgroundColor = 'silver'
            tokenDiv.innerText = '';
            tokenDiv.style.visibility = 'hidden'
        },
        addTokenToRoute(routeId, tokenKind, color) {
            const tokenDiv = document.getElementById(`token-${routeId}`);
            tokenDiv.style.backgroundColor = color;
            tokenDiv.innerText = TOKEN_READABLE_NAMES[tokenKind];
            tokenDiv.style.visibility = 'visible'
        },
        toggleAllTokenLocations(routes, visibilityStatus = 'visible') {
            routes.forEach(routeId => {
                document.getElementById(`token-${routeId}`).style.visibility = visibilityStatus
            })
        },
        addPieceToRouteNode(nodeId, playerColor, shape) {
            this.clearPieceFromRouteNode(nodeId);
            const routeNode = document.getElementById(nodeId);
            const playerPieceDiv = createDivWithClassAndIdAndStyle([`small-${shape}`], '',
                { backgroundColor: playerColor })
            routeNode.append(playerPieceDiv)
        },
        clearPieceFromRouteNode(nodeId) {
            const routeNode = document.getElementById(nodeId);
            routeNode.innerHTML = ''
        },
        addPieceToCity(city, playerColor) {
            const pieceHolder = document.getElementById(`${city.cityName}-${city.openSpotIndex}`)
            const targetShape = city.spotArray[city.openSpotIndex][0];
            if (document.getElementById(`freePoint-${city.cityName}`)) {
                document.getElementById(`freePoint-${city.cityName}`).remove();
            }
    
            const playerPieceDiv = createDivWithClassAndIdAndStyle(['cityPiece', targetShape], `piece-${city.cityName}-${city.openSpotIndex}`,
                { backgroundColor: playerColor })
            pieceHolder.append(playerPieceDiv)
        },
        switchPieceColor(pieceIdOne, pieceIdTwo) {
            const pieceOne = document.getElementById(pieceIdOne)
            const pieceTwo = document.getElementById(pieceIdTwo)
            const color1 = pieceOne.style.backgroundColor;
            const color2 = pieceTwo.style.backgroundColor;
            pieceOne.style.backgroundColor = color2;
            pieceTwo.style.backgroundColor = color1;
        },
        createBoardTokenHolder(location, routeId, direction, isStartingToken, tokenValue) {
            const TOKEN_DISTANCE = 120
            const TOKEN_SIZE = 55
            // These should *NOT* need a click handler - actually will need one when re-adding tokens
            // I think this should be called by createRouteAndTokenFromLocations
            const tokenDiv = createDivWithClassAndIdAndStyle(['onBoardToken', 'circle'], `token-${routeId}`)
            const [x, y] = offSetCoordinatesForSize(location[0] + (direction[0] * TOKEN_DISTANCE),
                location[1] + (direction[1] * TOKEN_DISTANCE), TOKEN_SIZE, TOKEN_SIZE)
            tokenDiv.style.left = x + 'px';
            tokenDiv.style.top = y + 'px';
            if (isStartingToken) {
                tokenDiv.style.visibility = 'visible'
                tokenDiv.style.backgroundColor = '#FFC000'
                tokenDiv.innerText = TOKEN_READABLE_NAMES[tokenValue]
            }
            tokenDiv.onclick = () => {
                logicBundle.inputHandlers.tokenLocationClickHandler(routeId)
            }
            this.board.append(tokenDiv)
            // I'm gonna be super hacky and just use an offset map. 
            // TODO fix this filth to use inverse slope and fixed distances (will still need a binary direction)
        },
    }
    logicBundle.boardController = boardController;
    return boardController;
}
