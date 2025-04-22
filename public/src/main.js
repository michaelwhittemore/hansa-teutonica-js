import { TEST_PLAYERS, TEST_BOARD_CONFIG_CITIES } from './helpers/constants.js';
import { inputHandlerFactory } from './mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from './mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from './mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from './mainLogic/playerBoardAndInformationControllerFactory.js'
import { gameLogControllerFactory } from './mainLogic/gameLogControllerFactory.js';
import { boardControllerFactory } from './mainLogic/boardControllerFactory.js';

import { logicBundle } from './helpers/logicBundle.js'; // This is just for easier testing

// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
gameLogControllerFactory();
inputHandlerFactory()
playerBoardAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();


const start = () => {
    window.logicBundle = logicBundle // This is just for testing
    gameController.initializeGameStateAndUI(TEST_PLAYERS, TEST_BOARD_CONFIG_CITIES)
}


window.onload = start
