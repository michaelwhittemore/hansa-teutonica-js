import { isShape, pluralifyText } from "../helpers/helpers.js";
import { BUTTON_LIST, USE_DEFAULT_CLICK_ACTIONS, TOKEN_READABLE_NAMES } from "../helpers/constants.js";
import { logicBundle } from "../helpers/logicBundle.js";


export const inputHandlerFactory = () => {

    const inputHandlers = {
        verifyPlayersTurn() {
            // THE LOGIC IS THAT IN NON-HOTSEAT PLAY THE INPUT HANDLER SHOULD TELL YOU TO WAIT
            // IT SHOULDN'T BE THE gameController's responsibility (I think??)

            // if not true will update action info with 'It isn't your turn'
            // pretend this checks if it's the correct player's turn 
            return true;
        },
        handleUpgradeButton() {
            inputHandlers.clearAllActionSelection();

            inputHandlers.selectedAction = 'upgrade'
            inputHandlers.updateActionInfoText("Select a city corresponding to an upgrade.", true)
        },
        handleTokenButton() {
            logicBundle.gameController.handleTokenMenuRequest()
        },
        handlePlaceButton() {
            inputHandlers.clearAllActionSelection();

            if (!inputHandlers.verifyPlayersTurn()) {
                return;
            }
            inputHandlers.selectedAction = 'place'
            inputHandlers.updateActionInfoText("Select a kind of piece to place and a location")
            inputHandlers.addShapeSelectionToActionInfo()
        },
        handleBumpButton() {
            inputHandlers.clearAllActionSelection();
            inputHandlers.selectedAction = 'selectPieceToBump'
            inputHandlers.updateActionInfoText('Select a shape to replace your rivals with, then select their piece.')
            inputHandlers.addShapeSelectionToActionInfo()
        },
        setUpBumpActionInfo(parameters) {
            const { nodeId, shape, squares, circles, shouldAddText } = parameters
            // 1. Toggle off all buttons
            this.toggleInputButtons(true)
            // 2. Add some player info to the action info box
            if (shouldAddText) {
                this.updateActionInfoText(`Your ${shape} has been displaced from ${nodeId}. `)
                this.updateActionInfoText(` You may place ${pluralifyText('square', squares)} and ${pluralifyText('circle', circles)}.\n`, false)

                if (squares && circles) {
                    this.addShapeSelectionToActionInfo()
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        this.additionalInfo = 'square';
                    }
                } else if (squares && !circles) {
                    this.additionalInfo = 'square';
                } else if (!squares && circles) {
                    this.additionalInfo = 'circle'
                }
            }

            // 3. If the player has both shapes left add a button. Otherwise set shape defaults

        },
        setUpTokenActionInfo(token, shouldHideTokenText = false) {
            this.clearAllActionSelection();
            this.toggleInputButtons(true)
            if (!shouldHideTokenText) {
                // We don't need to offer any token rules reminders to players who aren't doing the placing
                this.updateActionInfoText(`You must choose a completely unoccupied route to place your "${TOKEN_READABLE_NAMES[token]}" token.`)
            }
            this.selectedAction = 'placeNewToken';
        },
        handleMoveButton() {
            if (inputHandlers.selectedAction === 'move') {
                document.getElementById('move').innerText = 'Move Pieces'
                inputHandlers.clearAllActionSelection();
                logicBundle.gameController.endMoveAction();
                return;
            }
            inputHandlers.clearAllActionSelection();
            // Turn off all non-'move' buttons
            inputHandlers.toggleInputButtons(true, 'move')

            document.getElementById('move').innerText = 'End Move Action';

            inputHandlers.selectedAction = 'move'
            inputHandlers.additionalInfo = 'selectPieceToMove'

            // The below text should only occur when you're the player - might not even be
            // a problem as it's tied to an inputHandler method not the gameController
            inputHandlers.updateActionInfoText('Select one of your own pieces to move.')
        },
        handleCaptureCityButton() {
            inputHandlers.clearAllActionSelection();

            inputHandlers.selectedAction = 'capture';
            if (!inputHandlers.selectedLocation) {
                inputHandlers.updateActionInfoText('Select a city to capture');
            } else {
                let playerId = undefined
                if (!logicBundle.sessionInfo.isHotseatMode) {
                    // get the player name from sessionStorage
                }
                logicBundle.gameController.captureCity(inputHandlers.selectedLocation, playerId)
            }

        },
        handleResupplyButton() {
            logicBundle.gameController.resupply();
        },
        clearAllActionSelection() {
            // NOTE: I should *NOT* be using this just to clear action info
            document.getElementById('move').innerText = 'Move Pieces'
            inputHandlers.selectedAction = undefined;
            inputHandlers.selectedLocation = undefined;
            inputHandlers.additionalInfo = undefined;

            document.getElementById('actionInfo').innerHTML = ''
            document.getElementById('warningText').innerHTML = ''
            document.getElementById('tokenMenu').innerHTML = ''
        },
        bindInputHandlers() {
            document.getElementById('place').onclick = this.handlePlaceButton;
            document.getElementById('move').onclick = this.handleMoveButton;
            document.getElementById('bump').onclick = this.handleBumpButton;
            document.getElementById('resupply').onclick = this.handleResupplyButton;
            document.getElementById('capture').onclick = this.handleCaptureCityButton;
            document.getElementById('upgrade').onclick = this.handleUpgradeButton;
            document.getElementById('token').onclick = this.handleTokenButton;
        },
        toggleInputButtons(disabled, buttonToExclude = false) {
            BUTTON_LIST.forEach(buttonName => {
                if (buttonName !== buttonToExclude) {
                    document.getElementById(buttonName).disabled = disabled;
                }
            })
        },
        updateActionInfoText(text, overWrite = true) {
            // Eventually we might want action info to have its own controller object?
            // Especially given that we add buttons to it
            const actionInfoDiv = document.getElementById('actionInfo');
            if (overWrite) {
                actionInfoDiv.innerHTML = '';
            }
            actionInfoDiv.innerText += text;
        },
        populateTokenMenu(tokenArray) {
            // TODO -  make sure tokenMenu is being cleared elsewhere
            const tokenMenuDiv = document.getElementById('tokenMenu');
            tokenMenuDiv.innerText = 'Select a token to use: '
            const tokenButtonsCreated = {};
            tokenArray.forEach(tokenType => {
                if (!tokenButtonsCreated[tokenType]) {
                    tokenButtonsCreated[tokenType] = 1;
                    const button = document.createElement('button');
                    button.id = tokenType
                    button.innerText = TOKEN_READABLE_NAMES[tokenType]
                    button.onclick = () => {
                        logicBundle.gameController.useToken(tokenType);
                    }
                    tokenMenuDiv.append(button)
                } else {
                    tokenButtonsCreated[tokenType]++;
                    document.getElementById(tokenType).innerText = `${TOKEN_READABLE_NAMES[tokenType]} (x${tokenButtonsCreated[tokenType]})`
                }
            })
        },
        populateUpgradeMenuFromToken(upgrades) {
            const tokenMenuDiv = document.getElementById('tokenMenu');
            tokenMenuDiv.innerHTML = 'Select an upgrade: '
            upgrades.forEach(upgrade => {
                const button = document.createElement('button');
                button.innerText = upgrade
                // onclick with the type of upgrade
                button.onclick = () => {
                    logicBundle.gameController.tokenActions.useFreeUpgrade(upgrade)
                }
                tokenMenuDiv.append(button)
            })
        },
        populateMoveThreeMenu(movesLeft) {
            const tokenMenuDiv = document.getElementById('tokenMenu');
            tokenMenuDiv.innerHTML = `You have ${pluralifyText('move', movesLeft)} left. `
            const endEarlyButton = document.createElement('button');
            // TODO: rephrase button text
            endEarlyButton.innerText = 'End token moves';
            endEarlyButton.onclick = () => {
                console.log('end early clicked')
                logicBundle.gameController.tokenActions.endMoveThree();
            }
            tokenMenuDiv.append(endEarlyButton)
        },
        addShapeSelectionToActionInfo(useSquare = true, useCircle = true) {
            const actionInfoDiv = document.getElementById('actionInfo')
            if (useSquare) {
                const squareButton = document.createElement('button');
                squareButton.innerText = 'Square'
                squareButton.onclick = () => {
                    inputHandlers.additionalInfo = 'square'
                }
                actionInfoDiv.append(squareButton);
            }
            if (useCircle) {
                const circleButton = document.createElement('button');
                circleButton.innerText = 'Circle'
                circleButton.onclick = () => {
                    inputHandlers.additionalInfo = 'circle'
                }
                actionInfoDiv.append(circleButton);
            }
        },
        warnInvalidAction(warningText) {
            document.getElementById('warningText').innerHTML = '';
            document.getElementById('warningText').innerText = warningText
        },
        cityClickHandler(cityId) {
            if (!inputHandlers.selectedAction) {
                if (USE_DEFAULT_CLICK_ACTIONS) {
                    inputHandlers.selectedLocation = cityId;
                    inputHandlers.selectedAction = 'capture';
                } else {
                    // TODO handle no selected action on city click (presumably warn and clear)
                    return;
                }
            };
            if (inputHandlers.selectedAction === 'capture') {
                // Might need to pass in player ID
                logicBundle.gameController.captureCity(cityId, undefined)
            }
            if (inputHandlers.selectedAction === 'upgrade') {
                // Might need to pass in player ID
                logicBundle.gameController.upgradeAtCity(cityId, undefined)
            }

        },
        citySpotClickHandler(spotNumber, cityId) {
            if (inputHandlers.selectedAction !== 'switchPostSelection') {
                this.cityClickHandler(cityId)
                return;
            }
            logicBundle.gameController.tokenActions.selectedPostToSwitch(cityId, spotNumber)
        },
        tokenLocationClickHandler(routeId) {
            console.log('clicked token handler', routeId)
            if (this.selectedAction !== 'placeNewToken') {
                console.warn('Clicked on a token location without placeNewToken selected')
                return
            }
            logicBundle.gameController.replaceTokenAtLocation(routeId);
        },
        coellenSpecialAreaClickHandler(spotNumber){
            logicBundle.gameController.handleCoellenSpecialAreaClick(spotNumber)
        },
        routeNodeClickHandler(nodeId) {
            // dev 
            // I'm going to temporarily keep this here just in case we get issues in the future
            console.log('inputHandlers.selectedAction:', inputHandlers.selectedAction)
            switch (inputHandlers.selectedAction) {
                case 'move':
                    this.nodeActions.move(nodeId)
                    break;
                case 'place':
                    this.nodeActions.place(nodeId)
                    break;
                case 'selectPieceToBump':
                    this.nodeActions.selectPieceToBump(nodeId)
                    break
                case 'placeBumpedPiece':
                    this.nodeActions.placeSelectedBumpPieceOnNode(nodeId)
                    break
                case 'tokenMove':
                    this.nodeActions.moveToken(nodeId)
                    break
                default:
                    if (inputHandlers.selectedAction) {
                        // dev - will need to monitor the fact we call clearAllActionSelection here - 
                        // there may be unforeseen consequences
                        console.error('We should not be hitting default with a selected action')
                        this.clearAllActionSelection();
                        this.warnInvalidAction('Invalid action on a route node.')
                        return
                    }
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.additionalInfo = 'square'
                        this.nodeActions.place(nodeId)
                    } else {
                        console.warn('Nothing selected and no default')
                    }
            }

        },
        nodeActions: {
            selectPieceToBump(nodeId) {
                // Need to call a game controller method here
                // pass in the selected shape, other wise use default
                if (!isShape(inputHandlers?.additionalInfo)) {
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.additionalInfo = 'square'
                    } else {
                        console.warn('No shape selected')
                        return;
                    }
                }
                logicBundle.gameController.bumpPieceFromNode(nodeId, inputHandlers.additionalInfo);
            },
            placeSelectedBumpPieceOnNode(nodeId) {
                if (!isShape(inputHandlers?.additionalInfo)) {
                    console.error('Trying to do place a bumped piece without a shape.')
                }
                logicBundle.gameController.placeBumpedPieceOnNode(nodeId, inputHandlers.additionalInfo)
            },
            place(nodeId) {
                if (!isShape(inputHandlers?.additionalInfo)) {
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.additionalInfo = 'square'
                    } else {
                        console.warn('No shape selected')
                        return;
                    }
                }
                logicBundle.gameController.placeWorkerOnNodeAction(nodeId, inputHandlers.additionalInfo);
            },
            move(nodeId) {
                if (inputHandlers.additionalInfo === 'selectPieceToMove') {
                    logicBundle.gameController.selectPieceToMove(nodeId)
                } else if (inputHandlers.additionalInfo === 'selectLocationToMoveTo') {
                    logicBundle.gameController.movePieceToLocation(nodeId);
                }
            },
            moveToken(nodeId) {
                if (inputHandlers.additionalInfo === 'selectPiece') {
                    logicBundle.gameController.tokenActions.selectMoveThreePiece(nodeId)
                } else if (inputHandlers.additionalInfo === 'selectLocation') {
                    logicBundle.gameController.tokenActions.selectMoveThreeLocation(nodeId)
                } else {
                    console.error(`Unknown additional info: ${inputHandlers.additionalInfo}`)
                }
                console.log('move token action at', nodeId)
            }
        }
    }
    logicBundle.inputHandlers = inputHandlers
    return inputHandlers
}
