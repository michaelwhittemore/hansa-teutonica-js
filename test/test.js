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
    const city2 = createDivWithClassAndIdAndStyle(['testCity'], 'city2')
    const city3 = createDivWithClassAndIdAndStyle(['testCity'], 'city3')
    // We want to test that if the element is outside the view it's scrollable
    // Will need to use the overflow tag
    // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/translate

    testWrapper.append(city1, city2, city3)
    console.log(city1.getBoundingClientRect())
    console.log(city2.getBoundingClientRect())
}
window.onload = start