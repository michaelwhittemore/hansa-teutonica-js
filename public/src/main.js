import { TEST_PLAYERS_NAMES, TEST_BOARD_CONFIG_CITIES, TEST_PLAYER_COLORS,} from './helpers/constants.js';

import { inputHandlerFactory } from './mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from './mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from './mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from './mainLogic/playerBoardAndInformationControllerFactory.js'
import { gameLogControllerFactory } from './mainLogic/gameLogControllerFactory.js';
import { boardControllerFactory } from './mainLogic/boardControllerFactory.js';

// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
gameLogControllerFactory();
inputHandlerFactory()
playerBoardAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();


const start = () => {
    // window.gameController = gameController
    // TODO make all the useful objects available globally because working with modules is a headache
    // potentially do it in their factory function like where we link the logicBundle, alternatively just expose
    // the logic bundle
    gameController.initializeGameStateAndUI(TEST_PLAYERS_NAMES, TEST_PLAYER_COLORS, TEST_BOARD_CONFIG_CITIES)
}


window.onload = start
