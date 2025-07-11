// location is a coordinates x, y offset from the origin in the top right
export const BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray: [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3], ['Arnheim', 3]],
        unlock: 'actions',
        location: [20, 60]
    },
    'Beta': {
        name: 'Beta',
        spotArray: [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['Gamma', 4]],
        unlock: 'purse',
        location: [480, 60]
    },
    'Gamma': {
        name: 'Gamma',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        neighborRoutes: [['Delta', 3], ['Arnheim', 3]],
        unlock: 'colors',
        location: [600, 500]
    },
    'Delta': {
        name: 'Delta',
        freePoint: true,
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [1000, 350],
        neighborRoutes: [['Epsilon', 3], ['Stendal', 3]],
    },
    'Stendal': {
        name: 'Stendal',
        eastWestTerminus: true,
        spotArray: [['square', 'grey'], ['circle', 'grey'], ['square', 'orange'], ['square', 'purple']],
        location: [1300, 550],
    },
    'Epsilon': {
        name: 'Epsilon',
        unlock: 'keys',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [900, 55]
    },
    'Arnheim': {
        name: 'Arnheim',
        eastWestTerminus: true,
        freePoint: true,
        unlock: 'maxMovement',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [30, 370],
        neighborRoutes: [['Coellen', 3]],
    },
    'Coellen': {
        name: 'Coellen',
        freePoint: true,
        spotArray: [['square', 'grey']],
        location: [120, 670],
    },
    'Warburg': {
        name: 'Warburg',
        freePoint: true,
        spotArray: [['square', 'grey']],
        location: [500, 670],
        neighborRoutes: [['Coellen', 4]],
    },
};

export const COELLEN_SPECIAL_LOCATION = [250, 560]
export const COELLEN_SPECIAL_POINTS = [7, 8, 9, 11]
// maybe generalize this? 
export const COELLEN_SPECIAL_COLORS = ['grey', 'orange', 'purple', 'black']

// I don't think it makes sense to tie these to cities
// Each indicates which direction we're going and if one is a starting location
// They start off hidden unless they're starting
// array has x-direction, y-direction, isStarting
export const TOKEN_CONFIG_BY_ROUTES = {
    'Alpha-Beta': [0, .6, true],
    'Alpha-Arnheim': [.6, 0, true],
    'Beta-Gamma': [.5, -.5, true],
    'Gamma-Delta': [-.6, -.6],
    'Gamma-Arnheim': [0, -.6],
    'Delta-Epsilon': [-.7, .1],
    'Arnheim-Coellen': [.5, 0],
    'Delta-Stendal': [-.5, .5],
    'Warburg-Coellen': [0, .5,],

}