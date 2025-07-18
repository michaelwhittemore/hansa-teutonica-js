// location is a coordinates x, y offset from the origin in the top right
export const BOARD_CONFIG_CITIES = {
    'Groningen': {
        name: 'Groningen',
        freePoint: true,
        spotArray: [['square', 'grey'], ['circle', 'orange']],
        neighborRoutes: [['Emden', 3]],
        unlock: 'maxMovement',
        location: [20, 100]
    },
    'Emden': {
        name: 'Emden',
        spotArray: [['circle', 'grey'], ['square', 'purple']],
        neighborRoutes: [['Stade', 3]],
        location: [340, 80]
    },
    'Stade': {
        name: 'Stade',
        spotArray: [['circle', 'grey'],],
        neighborRoutes: [['Hamburg', 3]],
        unlock: 'colors',
        location: [650, 80]
    },
    'Hamburg': {
        name: 'Hamburg',
        spotArray: [['circle', 'grey'], ['square', 'orange'], ['square', 'black']],
        neighborRoutes: [['Lübeck', 3], ['Bremen', 4]],
        location: [1000, 60]
    },
    'Lübeck': {
        name: 'Lübeck',
        freePoint: true,
        spotArray: [['square', 'grey'], ['square', 'purple']],
        unlock: 'purse',
        location: [1340, 90]
    },
    'Osnabrück': {
        name: 'Osnabrück',
        spotArray: [['square', 'grey'], ['square', 'orange'], ['square', 'black']],
        neighborRoutes: [['Emden', 3], ['Bremen', 3]],
        location: [300, 320],
    },
    'Kampen': {
        name: 'Kampen',
        spotArray: [['circle', 'orange'], ['square', 'black']],
        neighborRoutes: [['Osnabrück', 3], ['Arnheim', 3]],
        location: [30, 240],
    },
    'Arnheim': {
        name: 'Arnheim',
        eastWestTerminus: true,
        spotArray: [['square', 'grey'], ['circle', 'grey'], ['square', 'orange'], ['square', 'black']],
        location: [30, 460],
        neighborRoutes: [['Duisburg', 3], ['Munster', 3]],
    },
    'Duisburg': {
        name: 'Duisburg',
        spotArray: [['square', 'grey']],
        location: [20, 685],
        neighborRoutes: [['Dortmund', 2]]
    },
    'Munster': {
        name: 'Munster',
        spotArray: [['square', 'grey'], ['circle', 'orange']],
        location: [410, 590],
    },
    'Bremen': {
        name: 'Bremen',
        spotArray: [['circle', 'grey'], ['square', 'purple']],
        location: [630, 200],
        neighborRoutes: [['Hannover', 3]],
    },
    'Minden': {
        name: 'Minden',
        spotArray: [['square', 'grey'], ['square', 'orange'], ['square', 'purple'], ['square', 'black']],
        location: [700, 430],
        neighborRoutes: [['Munster', 3], ['Bremen', 3], ['Hannover', 3], ['Paderborn', 3]],
    },
    'Hannover': {
        name: 'Hannover',
        spotArray: [['square', 'grey'], ['square', 'purple']],
        location: [900, 250],
        neighborRoutes: [['Lüneburg', 3]],
    },
    'Lüneburg': {
        name: 'Lüneburg',
        spotArray: [['circle', 'orange'], ['square', 'black']],
        location: [1200, 180],
        neighborRoutes: [['Perleberg', 3]],
    },
    'Perleberg': {
        name: 'Perleberg',
        spotArray: [['square', 'grey'], ['square', 'purple'], ['circle', 'black']],
        location: [1470, 350],
        neighborRoutes: [['Stendal', 3]],
    },
    'Stendal': {
        name: 'Stendal',
        eastWestTerminus: true,
        spotArray: [['square', 'grey'], ['circle', 'grey'], ['square', 'orange'], ['square', 'purple']],
        location: [1400, 550],
    },
    'Brunswiek': {
        name: 'Brunswiek',
        spotArray: [['square', 'orange']],
        location: [1100, 450],
        neighborRoutes: [['Minden', 4], ['Stendal', 4]],
    },
    'Dortmund': {
        name: 'Dortmund',
        spotArray: [['circle', 'grey'], ['square', 'orange'], ['square', 'purple']],
        location: [250, 690],
        neighborRoutes: [['Paderborn', 3]],
    },
    'Paderborn': {
        name: 'Paderborn',
        spotArray: [['square', 'grey'], ['circle', 'black']],
        location: [670, 700],
        neighborRoutes: [['Warburg', 3], ['Hildesheim', 3] ],
    },
    'Warburg': {
        name: 'Warburg',
        spotArray: [['square', 'orange'], ['square', 'purple']],
        location: [400, 900],
        neighborRoutes: [['Coellen', 4], ['Göttingen', 3]],
    },
    'Coellen': {
        name: 'Coellen',
        freePoint: true,
        spotArray: [['square', 'grey'], ['square', 'purple']],
        location: [30, 850],
    },
    'Göttingen': {
        name: 'Göttingen',
        unlock: 'actions',
        spotArray: [['square', 'grey'], ['circle', 'grey'], ['square', 'purple']],
        location: [800, 850],
        neighborRoutes: [['Quedlinburg', 3]],
    },
    'Quedlinburg': {
        name: 'Quedlinburg',
        spotArray: [['circle', 'orange'], ['circle', 'purple']],
        location: [1200, 800],
        neighborRoutes: [['Halle', 4]],
    },
    'Halle': {
        name: 'Halle',
        freePoint: true,
        unlock: 'keys',
        spotArray: [['square', 'grey'], ['square', 'orange']],
        location: [1500, 850],
    },
    'Hildesheim': {
        name: 'Hildesheim',
        spotArray: [['square', 'grey'], ['circle', 'black']],
        location: [970, 620],
    },
    'Goslar': {
        name: 'Goslar',
        spotArray: [['square', 'grey'], ['circle', 'black']],
        location: [1300, 620],
        neighborRoutes: [['Quedlinburg', 3], ['Hildesheim', 3]],
    },
    'Magdeburg': {
        name: 'Magdeburg',
        spotArray: [['circle', 'grey'], ['square', 'orange']],
        location: [1500, 720],
        neighborRoutes: [['Goslar', 2], ['Stendal', 3]],
    },
};

export const COELLEN_SPECIAL_LOCATION = [100, 755]

export const COELLEN_SPECIAL_POINTS = [7, 8, 9, 11]
export const COELLEN_SPECIAL_COLORS = ['grey', 'orange', 'purple', 'black']

export const EAST_WEST_TRACKER_LOCATION = [1250, 290]
export const EAST_WEST_POINTS = [7, 4, 2]

// I don't think it makes sense to tie these to cities
// Each indicates which direction we're going and if one is a starting location
// They start off hidden unless they're starting
// array has x-direction, y-direction, isStarting

// TODO - WILL NEED TO COMPLETELY REDO THIS, ALSO FIX THE STARTING TOKEN LOCATIONS
export const TOKEN_CONFIG_BY_ROUTES = {
    'Groningen-Emden': [0, .6, true],
    'Groningen-Arnheim': [.6, 0, true],
    'Emden-Gamma': [.5, -.5, true],
    'Gamma-Delta': [-.6, -.6],
    'Gamma-Arnheim': [0, -.6],
    'Delta-Epsilon': [-.7, .1],
    'Arnheim-Coellen': [.5, 0],
    'Delta-Stendal': [-.5, .5],
    'Warburg-Coellen': [0, .5,],
}