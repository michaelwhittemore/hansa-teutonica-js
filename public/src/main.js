// CONSTANTS
import {
    IS_HOTSEAT_MODE, TEST_PLAYERS_NAMES,
    TEST_BOARD_CONFIG_CITIES, TEST_PLAYER_COLORS, FIRST_PLAYER_SQUARES, STARTING_TOKENS,
    REGULAR_TOKENS_NUMBER_MAP, TOKEN_CONFIG_BY_ROUTES
} from './constants.js';
import {
    pluralifyText,
    createDivWithClassAndIdAndStyle,
    getRandomArrayElementAndModify,
    getRouteIdFromNodeId,
    offSetCoordinatesForSize,
    offSetCoordinatesForGameBoard,
    calculatePathBetweenElements,
} from './helpers/helpers.js';

import { inputHandlerFactory } from './mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from './mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from './mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from './mainLogic/playerBoardAndInformationControllerFactory.js'
import { gameLogControllerFactory } from './mainLogic/gameLogControllerFactory.js';
import { boardControllerFactory } from './mainLogic/boardControllerFactory.js';
import { Player } from './mainLogic/PlayerClass.js';
import { logicBundle } from './helpers/logicBundle.js'; // can delete this but want to log it
// NEW PLAN:
/* 
first deal with board controller so there's only main here. although I guess it doesn't matter that much
Ugh I'm worried I'm dealing with some serious anti-patterns here
I *think* we go with an object instead of a factory for the export. 
Once the logic bundle has been fully created (we still need the factories, but we don't take anything in)
then we can call some sort of setter method that takes in the logic bundle
ALTERNATIVELY, perhaps everything imports a single logicBundle that doesn't have any imports itself
We then add to this bundler in the main function
Maybe we have a 'buildLogicBundler' function
*/


// I don't think we even need to return anything other than the gameController (which has the initGame method)
// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
const gameLogController = gameLogControllerFactory();
const inputHandlers = inputHandlerFactory()
const playerBoardAndInformationController = playerBoardAndInformationControllerFactory()
const turnTrackerController = turnTrackerControllerFactory();
const boardController = boardControllerFactory();

console.log(logicBundle)

const unlockActionsToValue = [2, 3, 3, 4, 4, 5];
const unlockPurseToValue = [3, 5, 7, 'All'];
const unlockMovementToValue = [2, 3, 4, 5];
const unlockColorsToValue = ['grey', 'orange', 'purple', 'black'];
const unlockKeysToValue = [1, 2, 2, 3, 4];
// TODO can probably generate this programmatically somewhere
const unlockMapMaxValues = {
    "actions": 6,
    "purse": 4,
    "maxMovement": 4,
    "colors": 4,
    "keys": 5

}

const start = () => {
    // GLOBAL
    window.gameController = gameController
    // TODO make all the useful objects available globally because working with modules is a headache
    gameController.initializeGameStateAndUI(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS, TEST_BOARD_CONFIG_CITIES)
}


window.onload = start
