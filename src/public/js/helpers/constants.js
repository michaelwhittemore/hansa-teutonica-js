export const STARTING_BANK = 11;
export const FIRST_PLAYER_SQUARES = 5;
export const TEST_PLAYERS = [['Alice', '#ff0000'], ['Bob', '#0000ff'], ['Claire', '#008000'], ['Phil', '#ff1493']]
export const BUTTON_LIST = ['place', 'bump', 'resupply', 'capture', 'upgrade', 'token', 'move'];
export const USE_DEFAULT_CLICK_ACTIONS = true;
export const AUTO_SCROLL = true;
export const APPROXIMATE_NODE_OFFSET = 45 / 2;

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

export const ABILITIES_READABLE_NAME = {
    'actions': 'Actions',
    'purse': 'Bank',
    'maxMovement': 'Movement',
    'colors': 'Colors',
    'keys': 'Keys',
}

// TEST VARIABLES 
export const TEST_FREE_TOKENS = ['threeActions', 'freeUpgrade', 'threeActions', 'fourActions', 'bonusPost', 'bonusPost', 'switchPost', 'moveThree']

