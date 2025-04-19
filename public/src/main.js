// CONSTANTS
import { TEST_PLAYERS_NAMES, TEST_BOARD_CONFIG_CITIES, TEST_PLAYER_COLORS,} from './helpers/constants.js';

import { inputHandlerFactory } from './mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from './mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from './mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from './mainLogic/playerBoardAndInformationControllerFactory.js'
import { gameLogControllerFactory } from './mainLogic/gameLogControllerFactory.js';
import { boardControllerFactory } from './mainLogic/boardControllerFactory.js';

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
gameLogControllerFactory();
inputHandlerFactory()
playerBoardAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();


const start = () => {
    // GLOBAL
    window.gameController = gameController
    // TODO make all the useful objects available globally because working with modules is a headache
    gameController.initializeGameStateAndUI(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS, TEST_BOARD_CONFIG_CITIES)
}


window.onload = start
