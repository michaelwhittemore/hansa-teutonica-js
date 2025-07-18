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
        location: [650, 50]
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
        neighborRoutes: [['Warburg', 3], ['Hildesheim', 3]],
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
        location: [1500, 870],
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
        location: [1500, 770],
        neighborRoutes: [['Goslar', 2], ['Stendal', 3]],
    },
};

export const COELLEN_SPECIAL_LOCATION = [100, 755]

export const COELLEN_SPECIAL_POINTS = [7, 8, 9, 11]
export const COELLEN_SPECIAL_COLORS = ['grey', 'orange', 'purple', 'black']

export const EAST_WEST_TRACKER_LOCATION = [1250, 290]
export const EAST_WEST_POINTS = [7, 4, 2]

// Each indicates which direction we're going and if one is a starting location
// They start off hidden unless they're starting
// array has x-direction, y-direction, isStarting
export const TOKEN_CONFIG_BY_ROUTES = {
    'Groningen-Emden': [0, -0.32],
    'Emden-Stade': [0, 0.45],
    'Stade-Hamburg': [-0.3, 0.35],
    'Hamburg-Lübeck': [0.3, -0.3],
    'Hamburg-Bremen': [0.3, 0.32],
    'Osnabrück-Emden': [-0.32, 0],
    'Osnabrück-Bremen': [-0.3, -0.2, true],
    'Kampen-Osnabrück': [0.1, -0.32],
    'Kampen-Arnheim': [-0.32, 0.1],
    'Arnheim-Duisburg': [-0.31, -0.1],
    'Arnheim-Munster': [0.32, -0.32],
    'Duisburg-Dortmund': [0.05, -0.32],
    'Bremen-Hannover': [-0.1, 0.4],
    'Minden-Munster': [-0.3, -0.3],
    'Minden-Bremen': [-0.32, 0.2],
    'Minden-Hannover': [0.4, 0.25],
    'Minden-Paderborn': [-0.33, 0],
    'Hannover-Lüneburg': [-0.1, -0.32],
    'Lüneburg-Perleberg': [0.3, -0.3, true],
    'Perleberg-Stendal': [-0.35, 0],
    'Brunswiek-Minden': [0, 0.4],
    'Brunswiek-Stendal': [-0.2, 0.35],
    'Dortmund-Paderborn': [0, -0.32],
    'Paderborn-Warburg': [-0.25, -0.25],
    'Paderborn-Hildesheim': [0.29, 0.4],
    'Warburg-Göttingen': [0.1, -0.36],
    'Göttingen-Quedlinburg': [0.1, -0.32],
    'Quedlinburg-Halle': [-0.2, 0.36],
    'Goslar-Quedlinburg': [-0.33, 0],
    'Goslar-Hildesheim': [0, -0.31, true],
    'Magdeburg-Goslar': [-0.1, 0.22],
    'Magdeburg-Stendal': [0.4, 0],
    'Warburg-Coellen': [0.1, -0.33]
}