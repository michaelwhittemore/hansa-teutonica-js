export const STARTING_BANK = 11;
export const FIRST_PLAYER_SQUARES = 5;
export const TEST_PLAYERS = [['Alice', '#ff0000'], ['Bob', '#0000ff'], ['Claire', '#008000'], ['Phil', '#ff1493']]
export const BUTTON_LIST = ['place', 'bump', 'resupply', 'capture', 'upgrade', 'token', 'move'];
export const USE_DEFAULT_CLICK_ACTIONS = true;
export const AUTO_SCROLL = true;
export const APPROXIMATE_NODE_OFFSET = 45 / 2;

// location is a coordinates x, y offset from the origin in the top right
export const TEST_BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3], ['Zeta', 3]],
        unlock: 'actions',
        location: [20, 60]
    },
    'Beta': {
        name: 'Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['Gamma', 4]],
        unlock: 'purse',
        location: [480, 60]
    },
    'Gamma': {
        name: 'Gamma',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        neighborRoutes: [['Delta', 3], ['Zeta', 3]],
        unlock: 'colors',
        location: [600, 500]
    },
    'Delta': {
        name: 'Delta',
        freePoint: true,
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [1050, 350],
        neighborRoutes: [['Epsilon', 3]],
    },
    'Epsilon': {
        name: 'Epsilon',
        unlock: 'keys',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [900, 55]
    },
    'Zeta': {
        name: 'Zeta',
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
        location: [30, 630],
    },
};

export const COELLEN_SPECIAL_LOCATION = [170, 630]

// I don't think it makes sense to tie these to cities
// Each indicates which direction we're going and if one is a starting location
// They start off hidden unless they're starting
// array has x-direction, y-direction, isStarting
export const TOKEN_CONFIG_BY_ROUTES = {
    'Alpha-Beta': [0, .6, true],
    'Alpha-Zeta': [.6, 0, true],
    'Beta-Gamma': [.5, -.5, true],
    'Gamma-Delta': [-.6, -.6],
    'Gamma-Zeta': [0, -.6],
    'Delta-Epsilon': [-.7, .1],
    'Zeta-Coellen': [.5, 0,],
}

export const STARTING_TOKENS = ['bonusPost', 'moveThree', 'switchPost']
export const REGULAR_TOKENS = [
    "fourActions",
    "threeActions",
    "freeUpgrade",
    "moveThree",
    "switchPost",
    "moveThree",
    "bonusPost",
    "fourActions",
    "switchPost",
    "switchPost",
    "bonusPost",
    "bonusPost",
    "bonusPost",
    "threeActions",
    "freeUpgrade"
]
/*
const regularTokensArray = [];
Object.keys(REGULAR_TOKENS_NUMBER_MAP).forEach(key => {
    for (let i = 0; i < REGULAR_TOKENS_NUMBER_MAP[key]; i++) {
        regularTokensArray.push(key)
    }
})
*/

// RULES TODO, verify that the blow values do *NOT* include the gold starters
export const REGULAR_TOKENS_NUMBER_MAP = {
    'bonusPost': 4,
    'switchPost': 3,
    'moveThree': 2,
    'freeUpgrade': 2,
    'threeActions': 2,
    'fourActions': 2,
}

export const TOKEN_READABLE_NAMES = {
    bonusPost: 'Additional Trading Post',
    freeUpgrade: 'Develop One Ability',
    threeActions: 'Three Free Actions',
    fourActions: 'Four Free Actions',
    switchPost: 'Exchange Trading Posts',
    moveThree: 'Move Three Tradesmen',
}

// TEST VARIABLES 
export const TEST_FREE_TOKENS = ['threeActions', 'freeUpgrade', 'threeActions', 'fourActions', 'bonusPost', 'bonusPost', 'switchPost', 'moveThree']

