import { TEST_PLAYERS } from '../helpers/constants.js';
import { playerArrayFromSearchParams } from '../helpers/helpers.js'
import { inputHandlerFactory } from '../mainLogic/inputHandlersFactory.js';
import { gameControllerFactory } from '../mainLogic/gameControllerFactory.js';
import { turnTrackerControllerFactory } from '../mainLogic/turnTrackerControllerFactory.js';
import { playerDeskAndInformationControllerFactory } from '../mainLogic/playerDeskAndInformationControllerFactory.js'
import { logControllerFactory } from '../mainLogic/logControllerFactory.js';
import { boardControllerFactory } from '../mainLogic/boardControllerFactory.js';

import { logicBundle } from '../helpers/logicBundle.js'; // This is just for easier testing

// Maybe we rename 'factory' -> 'init' 
const gameController = gameControllerFactory();
logControllerFactory();
inputHandlerFactory()
playerDeskAndInformationControllerFactory()
turnTrackerControllerFactory();
boardControllerFactory();

const startHotseat = () => {
    logicBundle.sessionInfo.isHotseatMode = true;

    let startingPlayerArray;
    const searchParams = (new URL(location)).searchParams
    if (searchParams.get('resumeGame') && window.localStorage.isSaved) {
        console.warn('Need to load in game!')
        gameController.loadGame();
        return;
    }
    if (searchParams.size === 0) {
        // default case
        startingPlayerArray = TEST_PLAYERS;
    } else {
        startingPlayerArray = playerArrayFromSearchParams(searchParams)
    }
    gameController.initializeHotseatGame(startingPlayerArray)
}

const startOnline = async (roomName) => {
    logicBundle.sessionInfo.isHotseatMode = false;
    logicBundle.sessionInfo.roomName = roomName;

    // http://localhost:3000/onlineGame/testRoom1?participantId=iigJEToZqLT8NCpUukFgfz 1
    // http://localhost:3000/onlineGame/testRoom1?participantId=uW2d8XHHZn6SPb3vTak3uW 2
    // Note that the above link uses the test data that gets populated on the server

    let playerArray;
    const searchParams = (new URL(location)).searchParams
    const participantId = searchParams.get('participantId');
    if (!participantId) {
        // Keep this, we need the participantId to join
        console.error('Tried to join a lobby without a participantId')
        return
    }

    try {
        const url = window.location.origin + `/playerInformation/${roomName}`;
        const response = await fetch(url, {
            method: 'GET',
        });
        playerArray = await response.json();
    } catch (err) {
        console.error(err)
        return;
    }
    gameController.initializeOnlineGame(playerArray, roomName, participantId)
}

const start = () => {
    window.logicBundle = logicBundle // This is just for testing
    const parsedPath = window.location.pathname.split('/')
    if (parsedPath[1] === 'hotseat') {
        startHotseat()
    } else if (parsedPath[1] === 'onlineGame') {
        startOnline(parsedPath[2])
    } else {
        console.error('There is something wrong with the path')
    }
}

window.onload = start
