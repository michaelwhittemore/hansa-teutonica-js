console.log('here')

// copy pasted from helpers, need to delete
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

const start = () => {
    const testWrapper = document.getElementById('testWrapper')
    console.log('started')
    const city1 = createDivWithClassAndIdAndStyle(['testCity'], 'city1')
    const city2 = createDivWithClassAndIdAndStyle(['testCity'], 'city2', { backgroundColor: 'yellow' })
    const city3 = createDivWithClassAndIdAndStyle(['testCity'], 'city3')
    const city4 = createDivWithClassAndIdAndStyle(['testCity'], 'city4')
    const city5 = createDivWithClassAndIdAndStyle(['testCity'], 'city5')


    // We want to test that if the element is outside the view it's scrollable
    // Will need to use the overflow tag
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate

    // here! - my next step is to create a method to take in the coordinates and apply that to
    // a transform function - I should also offset the testWrapper to simulate what actually will happen

    // it's not an issue with scroll, it's an issue with my function - I think it doesn't play nice with a pre-transofrm
    // ok that explains city3, but what about city 5?? - oh I'm not appending it
    testWrapper.append(city1, city2, city3, city4, city5)
    console.log(city1.getBoundingClientRect())
    console.log(city2.getBoundingClientRect())
    translateElement(city1, 200, 200)
    translateElement(city2, 210, 210)
    translateElement(city3, 475, 45)
    translateElement(city4, 13, 600)
    translateElement(city5, 470, 15)
    // I have an idea! lets create the board WITHIN the wrapper

    // let's try with 200, 200.
}

const translateElement = (myElement, x, y) => {
    // x and y will be the target
    // This doesn't take the bounding into account yet
    const currentBounds = myElement.getBoundingClientRect()
    const xTarget = x - currentBounds.x
    const yTarget = y - currentBounds.y
    console.log(xTarget, yTarget)
    myElement.style.transform = ` translate(${xTarget}px, ${yTarget}px)`
    
    console.log(myElement.getBoundingClientRect())
}


window.onload = start