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

const startHotseat = () => {
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

const startOnline = (roomName) => {
    console.log('startOnline')
    // here!
    // dev
    // 1. I think we need to make a query to the server to get the play information from participant (i.e.)
    // name, and color - in that case we should use a test value in the server - 
    // 1. As part of the above we will need to add a 'playerInfo' or 'playerInfoFromParticipant' route
    // to the routing file (roomRoutes.js)
    // 1. Once the information is established we should open up the websocket. Does it make sense to use 
    // the startWaitingRoomServer and just rename it? We should probably rename it anyway
    // 2. I need a way to generate turn order - should it just be random for the moment? i.e. what order
    // the keys are generated
    // 3. I think we will need to modify gameController.initializeGameStateAndUI to include mode
    // or alternatively, we have two different methods for it, both of which then trickle down to 
    // gameController.initializeGameStateAndUI
    // 4. Let's see if I can just get a gameboard populated. 
    // 5. I think we will need to open up new websockets given that we're navigating to a new page


}

const start = () => {
    // dev let's break this into 'startHotseat' and 'startOnline' - use window.location.pathname
    // http://localhost:3000/onlineGame/testRoom
    window.logicBundle = logicBundle // This is just for testing
    const parsedPath = window.location.pathname.split('/')
    if(parsedPath[1]==='hotseat'){
        startHotseat()
    } else if (parsedPath[1]==='onlineGame'){
        startOnline(parsedPath[2])
        console.log('online with room name', parsedPath[2])
    } else {
        console.error('There is something wrong with the path')
    }
}

window.onload = start
