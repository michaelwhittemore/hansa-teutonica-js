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

const startOnline = async (roomName) => {
    console.log('startOnline')
    // http://localhost:3000/onlineGame/testRoom1?participantId=iigJEToZqLT8NCpUukFgfz
    // Noe that the above link uses the test data that gets populated on the server
    // dev
    // ~~1. I think we need to make a query to the server to get the play information from participant (i.e.)
    // name, and color - in that case we should use a test value in the server - ~~
    // ~~1. As part of the above we will need to add a 'playerInfo' or 'playerInfoFromParticipant' route
    // to the routing file (roomRoutes.js)~~
    // 2. We will need to return some kind of error if you're trying to join a session as a participant who
    // has already connected - may need to add an 'in use' field????
    // 1. Once the information is established we should open up the websocket. - maybe that should be
    // part of the API module
    // 2. I need a way to generate turn order - should it just be random for the moment? i.e. what order
    // the keys are generated
    // 3. I think we will need to modify gameController.initializeGameStateAndUI to include mode
    // or alternatively, we have two different methods for it, both of which then trickle down to 
    // gameController.initializeGameStateAndUI
    // 4. Let's see if I can just get a gameboard populated. 
    // 5. I think we will need to open up new websockets given that we're navigating to a new page

    // IMPORTANT - we might need to change this, we should be getting the whole player array 
    // We will need it to constructor the UI.
    // We still want to know the participant ID, as we need that to do validation

    // here!
    let playerArray;
    const searchParams = (new URL(location)).searchParams
    const participantId = searchParams.get('participantId');
    if (!participantId){
        // Keep this, we need the participantId to join
        console.error('Tried to join a lobby without a participantId')
        return
    }
    // try {
    //     const url = window.location.origin + `/playerInformation/${roomName}/${participantId}`;
    //     console.log(url)
    //     const response = await fetch(url, {
    //         method: 'GET',
    //     });
    //     responseBody = await response.json();
    // } catch (err) {
    //     console.error(err)
    //     return;
    // }
    try {
        const url = window.location.origin + `/playerInformation/${roomName}`;
        console.log(url)
        const response = await fetch(url, {
            method: 'GET',
        });
        playerArray = await response.json();
    } catch (err) {
        console.error(err)
        return;
    }
    console.log(playerArray)
    // now we should see if we can populate the board
    // Currently the method expects an array of arrays, not an array of objects 
    // which is causing the bugged behavior
    // I think we shouldn't change the input, instead we should change the method to account for 
    // online stuff
    gameController.initializeOnlineGame(playerArray)
}

const start = () => {
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
