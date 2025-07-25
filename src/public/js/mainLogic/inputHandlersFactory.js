import { isShape, pluralifyText } from "../helpers/helpers.js";
import { BUTTON_LIST, USE_DEFAULT_CLICK_ACTIONS, TOKEN_READABLE_NAMES, ABILITIES_READABLE_NAME } from "../helpers/constants.js";
import { logicBundle } from "../helpers/logicBundle.js";


export const inputHandlerFactory = () => {
    const inputHandlers = {
        state: {
            selectedAction: undefined,
            selectedLocation: undefined,
            additionalInfo: undefined,
        },
        verifyPlayersTurn() {
            // THE LOGIC IS THAT IN NON-HOTSEAT PLAY THE INPUT HANDLER SHOULD TELL YOU TO WAIT
            // IT SHOULDN'T BE THE gameController's responsibility (I think??)

            // if not true will update action info with 'It isn't your turn'
            // pretend this checks if it's the correct player's turn 
            return true;
        },
        handleUpgradeButton() {
            inputHandlers.clearAllActionSelection();

            inputHandlers.state.selectedAction = 'upgrade'
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
            inputHandlers.state.selectedAction = 'place'
            inputHandlers.updateActionInfoText('Select a kind of piece to place and a location');
            inputHandlers.addShapeSelectionToActionInfo()
        },
        handleBumpButton() {
            inputHandlers.clearAllActionSelection();
            inputHandlers.state.selectedAction = 'selectPieceToBump'
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
                        this.state.additionalInfo = 'square';
                    }
                } else if (squares && !circles) {
                    this.state.additionalInfo = 'square';
                } else if (!squares && circles) {
                    this.state.additionalInfo = 'circle'
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
            this.state.selectedAction = 'placeNewToken';
        },
        handleMoveButton() {
            if (inputHandlers.state.selectedAction === 'move') {
                document.getElementById('move').innerText = 'Move Pieces'
                inputHandlers.clearAllActionSelection();
                logicBundle.gameController.endMoveAction();
                return;
            }
            inputHandlers.clearAllActionSelection();
            // Turn off all non-'move' buttons
            inputHandlers.toggleInputButtons(true, 'move')

            document.getElementById('move').innerText = 'End Move Action';

            inputHandlers.state.selectedAction = 'move'
            inputHandlers.state.additionalInfo = 'selectPieceToMove'

            // The below text should only occur when you're the player - might not even be
            // a problem as it's tied to an inputHandler method not the gameController
            inputHandlers.updateActionInfoText('Select one of your own pieces to move.')
        },
        handleCaptureCityButton() {
            inputHandlers.clearAllActionSelection();

            inputHandlers.state.selectedAction = 'capture';
            if (!inputHandlers.state.selectedLocation) {
                inputHandlers.updateActionInfoText('Select a city to capture');
            } else {
                let playerId = undefined
                if (!logicBundle.sessionInfo.isHotseatMode) {
                    // get the player name from sessionStorage
                }
                logicBundle.gameController.captureCity(inputHandlers.state.selectedLocation, playerId)
            }

        },
        handleResupplyButton() {
            logicBundle.gameController.resupply();
        },
        clearAllActionSelection() {
            // NOTE: I should *NOT* be using this just to clear action info
            // TODO - break this into a state and a UI function (i.e.) clearActionsUI and clearInputHandler state
            // It's possible it makes sense to have a setToState method instead?
            document.getElementById('move').innerText = 'Move Pieces'
            inputHandlers.state.selectedAction = undefined;
            inputHandlers.state.selectedLocation = undefined;
            inputHandlers.state.additionalInfo = undefined;

            document.getElementById('actionInfo').innerHTML = ''
            document.getElementById('warningText').innerHTML = ''
            document.getElementById('tokenMenu').innerHTML = ''
            document.getElementById('tokenMenu').style.display = 'none'
            document.getElementById('actionBar').style.display = 'flex';
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
            this.clearAllActionSelection();
            const tokenMenuDiv = document.getElementById('tokenMenu');

            // potentially bad practice to modify the display like this?
            tokenMenuDiv.style.display = 'block';
            const tokenButtonsCreated = {};
            tokenArray.forEach(tokenType => {
                if (!tokenButtonsCreated[tokenType]) {
                    tokenButtonsCreated[tokenType] = 1;
                    const button = document.createElement('button');
                    button.id = tokenType
                    button.classList.add('tokenButton')
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
            const cancelTokenButton = document.createElement('button')
            cancelTokenButton.innerText = 'Cancel';
            cancelTokenButton.classList.add('cancelButton')
            cancelTokenButton.onclick = () => {
                this.clearAllActionSelection();
            }
            document.getElementById('actionBar').style.display = 'none'
            tokenMenuDiv.append(cancelTokenButton)
        },
        populateUpgradeMenuFromToken(upgrades) {
            const tokenMenuDiv = document.getElementById('tokenMenu');
            tokenMenuDiv.innerHTML = 'Select a free upgrade: '
            upgrades.forEach(upgrade => {
                const button = document.createElement('button');
                button.classList.add('tokenButton')
                button.innerText = ABILITIES_READABLE_NAME[upgrade]
                // onclick with the type of upgrade
                button.onclick = () => {
                    logicBundle.gameController.tokenActions.useFreeUpgrade(upgrade)
                }
                tokenMenuDiv.append(button)
            })
            const cancelTokenButton = document.createElement('button')
            
            cancelTokenButton.innerText = 'Cancel';
            cancelTokenButton.classList.add('cancelButton')
            cancelTokenButton.onclick = () => {
                this.clearAllActionSelection();
            }
            tokenMenuDiv.append(cancelTokenButton)
            console.log(cancelTokenButton)
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
                squareButton.classList.add('actionButton')
                squareButton.innerText = 'Square';
                squareButton.onclick = () => {
                    inputHandlers.state.additionalInfo = 'square'
                }
                actionInfoDiv.append(squareButton);
            }
            if (useCircle) {
                const circleButton = document.createElement('button');
                circleButton.innerText = 'Circle'
                circleButton.classList.add('actionButton')
                circleButton.onclick = () => {
                    inputHandlers.state.additionalInfo = 'circle'
                }
                actionInfoDiv.append(circleButton);
            }
        },
        warnInvalidAction(warningText) {
            document.getElementById('warningText').innerHTML = '';
            document.getElementById('warningText').innerText = warningText
        },
        cityClickHandler(cityId) {
            if (!inputHandlers.state.selectedAction) {
                if (USE_DEFAULT_CLICK_ACTIONS) {
                    inputHandlers.state.selectedLocation = cityId;
                    inputHandlers.state.selectedAction = 'capture';
                } else {
                    // TODO handle no selected action on city click (presumably warn and clear)
                    return;
                }
            };
            if (inputHandlers.state.selectedAction === 'capture') {
                // Might need to pass in player ID
                logicBundle.gameController.captureCity(cityId, undefined)
            }
            if (inputHandlers.state.selectedAction === 'upgrade') {
                // Might need to pass in player ID
                logicBundle.gameController.upgradeAtCity(cityId, undefined)
            }

        },
        citySpotClickHandler(spotNumber, cityId) {
            if (inputHandlers.state.selectedAction !== 'switchPostSelection') {
                this.cityClickHandler(cityId)
                return;
            }
            logicBundle.gameController.tokenActions.selectedPostToSwitch(cityId, spotNumber)
        },
        tokenLocationClickHandler(routeId) {
            console.log('clicked token handler', routeId)
            if (this.state.selectedAction !== 'placeNewToken') {
                console.warn('Clicked on a token location without placeNewToken selected')
                return
            }
            logicBundle.gameController.replaceTokenAtLocation(routeId);
        },
        coellenSpecialAreaClickHandler(spotNumber) {
            logicBundle.gameController.handleCoellenSpecialAreaClick(spotNumber)
        },
        routeNodeClickHandler(nodeId) {
            // I'm going to temporarily keep this here just in case we get issues in the future
            console.log('inputHandlers.state.selectedAction:', inputHandlers.state.selectedAction)
            switch (inputHandlers.state.selectedAction) {
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
                    if (inputHandlers.state.selectedAction) {
                        // we will need to monitor the fact we call clearAllActionSelection here - 
                        // there may be unforeseen consequences
                        console.error('We should not be hitting default with a selected action')
                        this.clearAllActionSelection();
                        this.warnInvalidAction('Invalid action on a route node.')
                        return
                    }
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.state.additionalInfo = 'square'
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
                if (!isShape(inputHandlers?.state.additionalInfo)) {
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.state.additionalInfo = 'square'
                    } else {
                        console.warn('No shape selected')
                        return;
                    }
                }
                logicBundle.gameController.bumpPieceFromNode(nodeId, inputHandlers.state.additionalInfo);
            },
            placeSelectedBumpPieceOnNode(nodeId) {
                if (!isShape(inputHandlers?.state.additionalInfo)) {
                    console.error('Trying to do place a bumped piece without a shape.')
                }
                logicBundle.gameController.placeBumpedPieceOnNode(nodeId, inputHandlers.state.additionalInfo)
            },
            place(nodeId) {
                if (!isShape(inputHandlers?.state.additionalInfo)) {
                    if (USE_DEFAULT_CLICK_ACTIONS) {
                        inputHandlers.state.additionalInfo = 'square'
                    } else {
                        console.warn('No shape selected')
                        return;
                    }
                }
                logicBundle.gameController.placeWorkerOnNodeAction(nodeId, inputHandlers.state.additionalInfo);
            },
            move(nodeId) {
                if (inputHandlers.state.additionalInfo === 'selectPieceToMove') {
                    logicBundle.gameController.selectPieceToMove(nodeId)
                } else if (inputHandlers.state.additionalInfo === 'selectLocationToMoveTo') {
                    logicBundle.gameController.movePieceToLocation(nodeId);
                }
            },
            moveToken(nodeId) {
                if (inputHandlers.state.additionalInfo === 'selectPiece') {
                    logicBundle.gameController.tokenActions.selectMoveThreePiece(nodeId)
                } else if (inputHandlers.state.additionalInfo === 'selectLocation') {
                    logicBundle.gameController.tokenActions.selectMoveThreeLocation(nodeId)
                } else {
                    console.error(`Unknown additional info: ${inputHandlers.state.additionalInfo}`)
                }
                console.log('move token action at', nodeId)
            }
        }
    }
    logicBundle.inputHandlers = inputHandlers
    return inputHandlers
}
