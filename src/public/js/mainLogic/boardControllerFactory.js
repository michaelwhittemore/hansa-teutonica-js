import { logicBundle } from "../helpers/logicBundle.js";
import {
    createDivWithClassAndIdAndStyle, calculatePathBetweenElements, offSetCoordinatesForSize, translateElement, addPixelAtLocationViaTransform
} from "../helpers/helpers.js";
import { TOKEN_READABLE_NAMES, ABILITIES_READABLE_NAME } from "../helpers/constants.js";
import { COELLEN_SPECIAL_POINTS, COELLEN_SPECIAL_COLORS, EAST_WEST_POINTS } from "../helpers/boardMapData.js";

export const boardControllerFactory = () => {
    const boardController = {
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
            const { name, spotArray, unlock, location, freePoint, eastWestTerminus } = cityInformation;
            // TODO - this is a button not a div. The name is wrong and in general I don't like it
            const cityDiv = document.createElement('button');

            cityDiv.className = 'city'
            if (eastWestTerminus) {
                cityDiv.classList.add('eastWestTerminus');
            }
            // We assume all cities have unique names as identifiers 
            cityDiv.id = name
            cityDiv.innerText = name;
            if (unlock) {
                cityDiv.innerHTML += `<br> <span class="unlockTextSpan">${ABILITIES_READABLE_NAME[unlock]}</span>`
                cityDiv.classList.add('unlockCity')
            }
            const cityPieceAreaDiv = createDivWithClassAndIdAndStyle(['cityPieceArea'])
            cityDiv.append(cityPieceAreaDiv)

            cityPieceAreaDiv.append(this.createCityBonusSpotArea(name))
            for (let i = 0; i < spotArray.length; i++) {
                const spotNumber = i;
                const spotInfo = spotArray[i]
                const citySpotDiv = createDivWithClassAndIdAndStyle([spotInfo[0], 'worker-holder', 'cityPieceHolder'],
                    `${name}-${i}`, { backgroundColor: spotInfo[1] });

                citySpotDiv.onclick = (event) => {
                    // We prevent the event from also bubbling up to the city click handler
                    event.stopPropagation();
                    logicBundle.inputHandlers.citySpotClickHandler(spotNumber, name)
                };
                if (i === 0 && freePoint) {
                    const freePointDiv = createDivWithClassAndIdAndStyle(['freePoint', 'circle', 'small-worker',
                        'centeredFlex'], `freePoint-${name}`);
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
        updateCityBorderColor(cityId, playerColor) {
            // This is used to indicate the controlling player
            document.getElementById(cityId).style.borderColor = playerColor
        },
        createCityBonusSpotArea(cityName) {
            const bonusBox = createDivWithClassAndIdAndStyle(['square', 'bonusBox', 'centeredFlex'], `bonus-${cityName}`)
            bonusBox.innerText = 'Bonus trading posts'
            return bonusBox;
        },
        addBonusPieceToCity(city, color, shape, numberOfPiecesAlreadyThere) {
            const bonusBox = document.getElementById(`bonus-${city.cityName}`)
            const bonusPiece = createDivWithClassAndIdAndStyle([shape, `bonusPiece`], '', { backgroundColor: color })

            if (numberOfPiecesAlreadyThere === 0) {
                // We only clear if there's no pieces, just the text
                bonusBox.innerText = ''
            }
            bonusBox.append(bonusPiece)

        },
        createRouteAndTokenFromLocations(routeProperties) {
            const { length, id, element1, element2, tokenDirection, isStartingToken, tokenValue } = routeProperties
            let { startX, startY, endX, endY } = calculatePathBetweenElements(element1, element2)

            const xDelta = endX - startX;
            const yDelta = endY - startY

            const xIncrement = xDelta / (length)
            const yIncrement = yDelta / (length)

            for (let i = 0; i < length; i++) {
                const nodeId = `${id}-${i}`;
                const routeNode = createDivWithClassAndIdAndStyle(['routeNode', 'worker-holder', 'centeredFlex', 'hoverable'],
                    nodeId)
                routeNode.id = nodeId;
                routeNode.onclick = () => {
                    logicBundle.inputHandlers.routeNodeClickHandler(nodeId)
                }

                let [xCoordinate, yCoordinate] = [startX + (xIncrement * (i + .5)),
                startY + (yIncrement * (i + .5))]
                // addPixelAtLocationViaTransform(xCoordinate, yCoordinate)

                let [x, y] = offSetCoordinatesForSize(xCoordinate, yCoordinate, 36.5, 36.5)

                this.board.append(routeNode)
                translateElement(routeNode, x, y)
            }
            let [xToken, yToken] = [startX + (xDelta / 2),
            startY + (yDelta / 2)];
            this.createBoardTokenHolder([xToken, yToken], id, tokenDirection, isStartingToken, tokenValue)
        },
        clearTokenFromRouteAndHide(routeId) {
            const tokenDiv = document.getElementById(`token-${routeId}`);
            tokenDiv.style.backgroundColor = 'silver'
            const tokenDivText = document.getElementById(`token-text-${routeId}`);
            tokenDivText.innerText = '';
            tokenDiv.style.visibility = 'hidden'
        },
        addTokenToRoute(routeId, tokenKind, color) {
            const tokenDiv = document.getElementById(`token-${routeId}`);
            tokenDiv.style.backgroundColor = color;
            const tokenDivText = document.getElementById(`token-text-${routeId}`);
            tokenDivText.innerText = TOKEN_READABLE_NAMES[tokenKind];
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
            const playerPieceDiv = createDivWithClassAndIdAndStyle(['small-worker', shape], '',
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

            const playerPieceDiv = createDivWithClassAndIdAndStyle(['small-worker', targetShape], `piece-${city.cityName}-${city.openSpotIndex}`,
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
            // addPixelAtLocationViaTransform(location[0], location[1], true) // This is useful for future 
            // cities, let's not delete it
            const TOKEN_DISTANCE = 120
            const TOKEN_SIZE = 55

            const tokenDiv = createDivWithClassAndIdAndStyle(['onBoardToken', 'circle'], `token-${routeId}`)
            const [x, y] = offSetCoordinatesForSize(location[0] + (direction[0] * TOKEN_DISTANCE),
                location[1] + (direction[1] * TOKEN_DISTANCE), TOKEN_SIZE, TOKEN_SIZE)

            const tokenDivText = createDivWithClassAndIdAndStyle([], `token-text-${routeId}`)
            tokenDiv.append(tokenDivText);
            if (isStartingToken) {
                tokenDiv.style.visibility = 'visible'
                tokenDiv.style.backgroundColor = '#FFC000'
                tokenDivText.innerText = TOKEN_READABLE_NAMES[tokenValue]
            }

            tokenDiv.onclick = () => {
                logicBundle.inputHandlers.tokenLocationClickHandler(routeId)
            }
            const tokenToolTip = createDivWithClassAndIdAndStyle(['tokenToolTip'])
            tokenToolTip.innerText = routeId
            tokenDiv.append(tokenToolTip)

            this.board.append(tokenDiv)

            translateElement(tokenDiv, x, y)
            // I'm gonna be super hacky and just use an offset map. 
            // TODO fix this filth to use inverse slope and fixed distances (will still need a binary direction)
        },
        createCoellenSpecialArea(location) {
            const coellenSpecialAreaDiv = createDivWithClassAndIdAndStyle(['centeredFlex', 'city'], 'coellenSpecialArea')
            const textBanner = createDivWithClassAndIdAndStyle(['banner'])
            textBanner.innerText = 'Coellen-Warburg Special Points'
            const circleHolder = createDivWithClassAndIdAndStyle(['cityPieceArea'])

            coellenSpecialAreaDiv.append(textBanner, circleHolder)

            for (const [index, color] of COELLEN_SPECIAL_COLORS.entries()) {
                const pointValue = COELLEN_SPECIAL_POINTS[index]
                const specialSpotDiv = createDivWithClassAndIdAndStyle(['circle', 'worker-holder', 'cityPieceHolder'],
                    `coellenPieceSpot-${index}`, { backgroundColor: color });
                const specialPointDiv = createDivWithClassAndIdAndStyle(['coellenPoint'], `specialPointDiv-${index}`);
                specialPointDiv.innerText = pointValue;
                specialSpotDiv.append(specialPointDiv)

                specialSpotDiv.onclick = () => {
                    logicBundle.inputHandlers.coellenSpecialAreaClickHandler(index)
                }
                circleHolder.append(specialSpotDiv)
            }

            document.getElementById('gameBoard').append(coellenSpecialAreaDiv)
            translateElement(coellenSpecialAreaDiv, location[0], location[1])
        },
        addPieceToCoellenSpecialArea(specialPointsIndex, playerColor) {
            const specialSpotDiv = document.getElementById(`coellenPieceSpot-${specialPointsIndex}`)
            document.getElementById(`specialPointDiv-${specialPointsIndex}`).remove()

            const playerPieceDiv = createDivWithClassAndIdAndStyle(['small-worker', 'circle'],
                `coellenSpecialPlayer-${specialPointsIndex}`, { backgroundColor: playerColor })
            specialSpotDiv.append(playerPieceDiv)
        },
        createEastWestPointTracker(location) {
            const eastWestPointTrackerDiv = createDivWithClassAndIdAndStyle([], 'eastWestTracker')

            const textBanner = createDivWithClassAndIdAndStyle(['banner', 'eastWestBanner'])
            textBanner.innerText = 'East-West Connection Bonus'
            const circleHolder = createDivWithClassAndIdAndStyle([], 'eastWestPieceArea')

            // offset takes the form of [left px, bottom px]
            const lineCoordinates = [[17, 17], [35, 0]];

            EAST_WEST_POINTS.forEach((pointValue, index) => {
                const eastWestSpotDiv = createDivWithClassAndIdAndStyle(['circle', 'worker-holder', 'eastWestHolder',
                    'cityPieceHolder'], `eastWestHolder-${pointValue}`, {
                    'transform': `translate(${30 * index}px)`,
                });
                const eastWestPointDiv = createDivWithClassAndIdAndStyle(['coellenPoint'], `eastWestPoint-${pointValue}`);
                eastWestPointDiv.innerText = pointValue;
                eastWestSpotDiv.append(eastWestPointDiv)
                circleHolder.append(eastWestSpotDiv)
                if (index < 2) {
                    const lineElement = document.createElement('hr')
                    lineElement.classList.add('eastWestLine')
                    lineElement.style.left = `${lineCoordinates[index][0]}px`
                    lineElement.style.bottom = `${lineCoordinates[index][1]}px`

                    circleHolder.append(lineElement)
                }
            })
            eastWestPointTrackerDiv.append(textBanner, circleHolder)

            document.getElementById('gameBoard').append(eastWestPointTrackerDiv)
            translateElement(eastWestPointTrackerDiv, location[0], location[1])
        },
        addPieceToEastWestPoints(pointValue, playerColor) {
            // TODO, there's some copy paste between here, colleen points, and free city points.
            // Maybe move some logic to shared function?
            const eastWestHolder = document.getElementById(`eastWestHolder-${pointValue}`)
            document.getElementById(`eastWestPoint-${pointValue}`).remove()

            const playerPieceDiv = createDivWithClassAndIdAndStyle(['small-worker', 'circle'],
                `eastWestPlayer-${pointValue}`, { backgroundColor: playerColor })
            eastWestHolder.append(playerPieceDiv)
        },
    }
    logicBundle.boardController = boardController;
    return boardController;
}
