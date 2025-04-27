import { TEST_PLAYERS, TEST_BOARD_CONFIG_CITIES } from './helpers/constants.js';
import { inputHandlerFactory } from './mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from './mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from './mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from './mainLogic/playerBoardAndInformationControllerFactory.js'
import { logControllerFactory } from './mainLogic/logControllerFactory.js';
import { boardControllerFactory } from './mainLogic/boardControllerFactory.js';

import { logicBundle } from './helpers/logicBundle.js'; // This is just for easier testing

// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
logControllerFactory();
inputHandlerFactory()
playerBoardAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();

const playerArrayFromSearchParams = (params) => {
    const playerArray = []
    for (let i = 0; i< params.get('playerNumber'); i++){
        const name = params.get(`playerName-${i}`)
        const color = params.get(`playerColor-${i}`)
        playerArray.push([name, color])
    }
    return playerArray
}

// TODO need to have a url parser that creates anm player array (otherwise we default to TEST_PLAYERS)
const start = () => {
    let startingPlayerArray;
    const searchParams = (new URL(location)).searchParams
    if (searchParams.size === 0){
        // default case
        startingPlayerArray = TEST_PLAYERS;
    } else {
        startingPlayerArray = playerArrayFromSearchParams(searchParams)
    }
    window.logicBundle = logicBundle // This is just for testing
    gameController.initializeGameStateAndUI(startingPlayerArray, TEST_BOARD_CONFIG_CITIES)
}

window.onload = start
