
// --------------------------------------------------------------------------------------------------------
// MAIN GAME LOGIC HELPERS
// --------------------------------------------------------------------------------------------------------
export const isShape = (inputString) => inputString === 'square' || inputString === 'circle';
export const pluralifyText = (item, number) => {
    return `${number} ${item}${number !== 1 ? 's' : ''}`
}
export const createDivWithClassAndIdAndStyle = (classNameArray, id, styles) => {
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
export const getRandomArrayElementAndModify = (array) => {
    if (array.length === 0) {
        console.error('calling getRandomArrayElementAndModify with a 0 length array')
        return
    }
    const index = Math.floor(Math.random() * (array.length))
    if (index === array.length) {
        console.error('index === array.length, did not think this could happen')
    }
    const element = array[index]
    array.splice(index, 1)
    return element
}
export const getRouteIdFromNodeId = (nodeId) => {
    return nodeId.slice(0, nodeId.lastIndexOf('-'));
}
export const offSetCoordinatesForSize = (x, y, height = 45, width = 45) => {
    console.log('params', x,y,height,width)
    if (Number.isNaN(y)){
        console.error('NANANANA')
        // debugger
    }
    // dev
    // This function will center an object instead of placing it with the top left at (x,y)
    console.log('offset for size', [x - (width / 2), y - (height / 2)])
    return ([x - (width / 2), y - (height / 2)]);
}

export const calculateSlopeFromCoordinatePairs = (x1, y1, x2, y2) => {
    return (y2 - y1) / (x2 - x1)
}

export const findEdgeIntersectionPointFromRects = (rect1, rect2) => {
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

export const calculatePathBetweenElements = (element1, element2) => {
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

export const drawLine = (element1, element2) => {
    const LINE_LENGTH = 25
    const domRect1 = element1.getBoundingClientRect()
    const domRect2 = element2.getBoundingClientRect()
    const xCenter1 = domRect1.x + (0.5 * domRect1.width)
    const yCenter1 = domRect1.y + (0.5 * domRect1.height)
    const xCenter2 = domRect2.x + (0.5 * domRect2.width)
    const yCenter2 = domRect2.y + (0.5 * domRect2.height)

    const gameBoardDomRect = document.getElementById('gameBoard').getBoundingClientRect()
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

export const shuffleArray = (array) => {
    for (let i = array.length - 1; i >= 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array
}

// --------------------------------------------------------------------------------------------------------
// LANDING PAGE/ WAITING ROOM HELPERS
// --------------------------------------------------------------------------------------------------------

export const validateName = (nameString) => {
    if (nameString === '') {
        return [false, 'Names may not be empty.']
    }
    if (nameString.length > 20){
        return [false, 'Names may not be longer than 20 characters.']
    }
    // ^[a-zA-Z0-9\_]*$ 
    /*
    "^" : Start of string
    "[a-zA-Z0-9_]": Matches alphanumeric or underscore (don't need to escape underscore)
    "*": Zero or more instances of the preceding regex token
    "$": End of string
    */
    if (!/^[a-zA-Z0-9_]*$/.test(nameString)) {
        return [false, 'Names can only contain alphanumerics or underscores.']
    }
    return [true, 'This should never be displayed']
}

// IMPORTANT, THIS FUNCTION NEEDS ITS OWN CSS FOR THE COLOR PICKER
// TODO - maybe move the aforementioned css to it's own file?
export const createColorPickerWithOnClick = (onClickFunction) => {
    const colorOptions = [
        '#696969',
        '#a52a2a',
        '#008000',
        '#4b0082',
        '#ff0000',
        '#00ced1',
        '#ffa500',
        '#7cfc00',
        '#00fa9a',
        '#0000ff',
        '#ff00ff',
        '#1e90ff',
        '#eee8aa',
        '#ffff54',
        '#dda0dd',
        '#ff1493',
    ]
    const colorPicker = createDivWithClassAndIdAndStyle(['colorPicker'], 'colorPicker', {
        visibility: 'hidden'
    })
    colorOptions.forEach(color => {
        const colorSelector = createDivWithClassAndIdAndStyle(['colorSelection'], color, {
            'backgroundColor': color
        })
        colorSelector.onclick = () => {
            onClickFunction(color)
        }
        colorPicker.append(colorSelector)
    })
    return colorPicker
}

export const playerArrayFromSearchParams = (params) => {
    const playerArray = []
    for (let i = 0; i< params.get('playerNumber'); i++){
        const name = params.get(`playerName-${i}`)
        const color = params.get(`playerColor-${i}`)
        playerArray.push([name, color])
    }
    return playerArray
}

export const createColoredSpanWithText = (text, color) => {
    // TODO, replace all instances of colored span with this helper
    // this might need to take in an id as well?
    return `<span style="color: ${color}">${text}</span>`
}

export const addGitHubLink = () => {
    const linkElement = document.createElement('a')
    linkElement.href = 'https://github.com/michaelwhittemore/hansa-teutonica-js'
    const img = document.createElement('img')
    img.src = '../../images/github-mark.svg'
    linkElement.append(img)
    linkElement.style.position = 'absolute';
    linkElement.style.bottom = '1px';
    linkElement.style.left = '1px';
    document.body.append(linkElement)
}

// TEST, DELETE THIS TODO
const addPixelAtLocation = (x, y, isBig = false, color, id = undefined) => {
    const testElement = document.createElement('div')
    testElement.className = isBig ? 'testBigPixel' : 'testSinglePixel';

    testElement.id = 'TEST';
    if (id) {
        testElement.id = id
    }
    testElement.style.left = x + 'px'
    testElement.style.top = y + 'px'
    if (color) {
        testElement.style.backgroundColor = color
    }
    document.getElementById('gameBoard').append(testElement)

    return testElement
}