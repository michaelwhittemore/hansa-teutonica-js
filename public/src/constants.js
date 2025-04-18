const STARTING_BANK = 15; // no clue if this is correct (GAME RULES) - see https://cdn.1j1ju.com/medias/df/af/68-hansa-teutonica-big-box-rulebook.pdf - page 3 for settup
const FIRST_PLAYER_SQUARES = 6;
const TEST_PLAYERS_NAMES = ['Alice', 'Bob', 'Claire', 'Phil']
const TEST_PLAYER_COLORS = ['red', 'blue', 'green', 'pink']
const BUTTON_LIST = ['place', 'bump', 'resupply', 'capture', 'upgrade', 'token', 'move'];
const IS_HOTSEAT_MODE = true;
const USE_DEFAULT_CLICK_ACTIONS = true;
const AUTO_SCROLL = true;
const APPROXIMATE_NODE_OFFSET = 45 / 2;

// location is a coordinates x, y offset from the origin in the top right
const TEST_BOARD_CONFIG_CITIES = {
    'Alpha': {
        name: 'Alpha',
        spotArray:
            [['square', 'grey'], ['circle', 'grey'], ['square', 'orange']],
        neighborRoutes: [['Beta', 3], ['Zeta', 3]],
        unlock: 'actions',
        location: [20, 20]
    },
    'Beta': {
        name: 'Beta',
        spotArray:
            [['circle', 'grey'], ['square', 'grey']],
        neighborRoutes: [['Gamma', 4]],
        unlock: 'purse',
        location: [480, 20]
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
        location: [1000, 300],
        neighborRoutes: [['Epsilon', 3]],
    },
    'Epsilon': {
        name: 'Epsilon',
        unlock: 'keys',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [900, 20]
    },
    'Zeta': {
        name: 'Zeta',
        freePoint: true,
        unlock: 'maxMovement',
        spotArray: [['square', 'grey'], ['circle', 'purple']],
        location: [30, 450],
    },

};

const STARTING_TOKENS = ['bonusPost', 'moveThree', 'switchPost']
// RULES TODO, verify that the blow values do *NOT* include the gold starters
const REGULAR_TOKENS_NUMBER_MAP = {
    'bonusPost': 4,
    'switchPost': 3,
    'moveThree': 2,
    'freeUpgrade': 2,
    'threeActions': 2,
    'fourActions': 2,
}

// I don't think it makes sense to tie these to cities
// Each indicates which direction we're going and if one is a starting location
// They start off hidden unless they're starting
// array has xdirection, ydirection, isStarting
const TOKEN_CONFIG_BY_ROUTES = {
    'Alpha-Beta': [0, .6, true],
    'Alpha-Zeta': [.6, 0, true],
    'Beta-Gamma': [.5, -.5, true],
    'Gamma-Delta': [-.6, -.6],
    'Gamma-Zeta': [0, -.6],
    'Delta-Epsilon': [-.7, .1],
}

// The below can be used to fix my name mapping issue, but then deleted I think
const PLAYER_FIELDS_TO_TEXT_MAP = {
    name: 'Name',
    color: 'Color',
    keys: 'Keys',
    unlockedColors: 'Unlocked Colors',
    supplySquares: 'Traders (Squares) in Supply',
    bankedSquares: 'Traders (Squares) in Bank',
    supplyCircles: 'Merchants (Circles) in Supply',
    bankedCircles: 'Merchants (Circles) in Bank',
    maxActions: 'Max Actions',
    currentActions: 'Actions Remaining',
    currentPoints: 'Current Non-Endgame Points',
    maxMovement: 'Maximum Piece Movement',
    purse: 'Maximum Resupply'
}


// TEST VARIABLES 
const TEST_FREE_TOKENS = ['threeActions', 'freeUpgrade', 'threeActions', 'fourActions', 'bonusPost', 'bonusPost', 'switchPost', 'moveThree']

export default {
    STARTING_BANK,
    FIRST_PLAYER_SQUARES,
    TEST_PLAYER_COLORS,
    TEST_PLAYERS_NAMES,
    BUTTON_LIST,
    IS_HOTSEAT_MODE,
    USE_DEFAULT_CLICK_ACTIONS,
    AUTO_SCROLL,
    APPROXIMATE_NODE_OFFSET,
    REGULAR_TOKENS_NUMBER_MAP,
    TEST_BOARD_CONFIG_CITIES,
    STARTING_TOKENS,
    TOKEN_CONFIG_BY_ROUTES,
    PLAYER_FIELDS_TO_TEXT_MAP,
    TEST_FREE_TOKENS
}