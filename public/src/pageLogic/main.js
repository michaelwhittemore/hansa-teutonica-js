import { TEST_PLAYERS } from '../helpers/constants.js';
import { playerArrayFromSearchParams } from '../helpers/helpers.js'
import { inputHandlerFactory } from '../mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from '../mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from '../mainLogic/turnTrackerControllerFactory.js';
import { playerBoardAndInformationControllerFactory } from '../mainLogic/playerBoardAndInformationControllerFactory.js'
import { logControllerFactory } from '../mainLogic/logControllerFactory.js';
import { boardControllerFactory } from '../mainLogic/boardControllerFactory.js';

import { logicBundle } from '../helpers/logicBundle.js'; // This is just for easier testing

// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
logControllerFactory();
inputHandlerFactory()
playerBoardAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();

const start = () => {
    window.logicBundle = logicBundle // This is just for testing

    let startingPlayerArray;
    const searchParams = (new URL(location)).searchParams
    if (searchParams.get('resumeGame') && window.localStorage.isSaved){
        console.warn('Need to load in game!')
        gameController.loadGame();
        return;
    }
    if (searchParams.size === 0){
        // default case
        startingPlayerArray = TEST_PLAYERS;
    } else {
        startingPlayerArray = playerArrayFromSearchParams(searchParams)
    }

    gameController.initializeGameStateAndUI(startingPlayerArray)
}

window.onload = start
