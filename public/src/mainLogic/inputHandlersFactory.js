// I think we should import the constants and helpers here, not use dependencies like I do now
import {isShape, pluralifyText} from "../helpers/helpers.js";
import { IS_HOTSEAT_MODE, BUTTON_LIST, USE_DEFAULT_CLICK_ACTIONS } from "../constants.js";

export const inputHandlerFactory = (logicBundle) => {
    const { gameController} = logicBundle;

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
            // We will still need to call the gameController as the game controller both needs to verify
            // That it's the correct player's turn and needs to know the tokens the player owns
            gameController.handleTokenMenuRequest()
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
        setUpBumpActionInfo(nodeId, shape, squares, circles) {
            // 1. Toggle off all buttons
            this.toggleInputButtons(true)
            // 2. Add some player info to the action info box
            this.updateActionInfoText(`Your ${shape} has been displaced from ${nodeId}. `)
            // Would like a helper to deal with plurals
            // takes in a number and a shape. Creates a string with the text and an optional s
            this.updateActionInfoText(` You may place ${pluralifyText('square', squares)} and ${pluralifyText('circle', circles)}.\n`, false)
            // 3. If the player has both shapes left add a button. Otherwise set shape defaults
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
        },
        setUpTokenActionInfo(token) {
            this.clearAllActionSelection();
            this.toggleInputButtons(true)
            this.updateActionInfoText(`You must choose a completely unoccupied route to place your "${token}" token.`)
            this.selectedAction = 'placeNewToken';
        },
        handleMoveButton() {
            if (inputHandlers.selectedAction === 'move') {
                document.getElementById('move').innerText = 'Move Pieces'
                inputHandlers.clearAllActionSelection();
                gameController.endMoveAction();
                return;
            }
            inputHandlers.clearAllActionSelection();
            // Turn off all non-'move' buttons
            inputHandlers.toggleInputButtons(true, 'move')

            document.getElementById('move').innerText = 'End Move Action';

            inputHandlers.selectedAction = 'move'
            inputHandlers.additionalInfo = 'selectPieceToMove'

            inputHandlers.updateActionInfoText('Select one of your own pieces to move.')
        },
        handleCaptureCityButton() {
            inputHandlers.clearAllActionSelection();

            inputHandlers.selectedAction = 'capture';
            if (!inputHandlers.selectedLocation) {
                inputHandlers.updateActionInfoText('Select a city to capture');
            } else {
                let playerId = undefined
                if (!IS_HOTSEAT_MODE) {
                    // get the player name from sessionStorage
                }
                gameController.captureCity(inputHandlers.selectedLocation, playerId)
            }

        },
        handleResupplyButton() {
            let playerId = undefined
            if (!IS_HOTSEAT_MODE) {
                // get the player name from sessionStorage
            }
            gameController.resupply(playerId);
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
                    button.innerText = tokenType
                    button.onclick = () => {
                        gameController.useToken(tokenType);
                    }
                    tokenMenuDiv.append(button)
                } else {
                    tokenButtonsCreated[tokenType]++;
                    document.getElementById(tokenType).innerText = `${tokenType} (x${tokenButtonsCreated[tokenType]})`
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
                    gameController.tokenActions.useFreeUpgrade(upgrade)
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
                gameController.tokenActions.endMoveThree();
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
                gameController.captureCity(cityId, undefined)
            }
            if (inputHandlers.selectedAction === 'upgrade') {
                // Might need to pass in player ID
                gameController.upgradeAtCity(cityId, undefined)
            }

        },
        citySpotClickHandler(spotNumber, cityId) {
            if (inputHandlers.selectedAction !== 'switchPostSelection') {
                this.cityClickHandler(cityId)
                return;
            }
            gameController.tokenActions.selectedPostToSwitch(cityId, spotNumber)
        },
        tokenLocationClickHandler(routeId) {
            console.log('clicked token handler', routeId)
            if (this.selectedAction !== 'placeNewToken') {
                console.warn('Clicked on a token location without placeNewToken selected')
                return
            }
            gameController.replaceTokenAtLocation(routeId);
            // TODO will need to get playerId from the input handler in the case of online play

        },
        routeNodeClickHandler(nodeId) {
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
                        console.error('We should not be hitting default with a selected action')
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
                gameController.bumpPieceFromNode(nodeId, inputHandlers.additionalInfo);
            },
            placeSelectedBumpPieceOnNode(nodeId) {
                if (!isShape(inputHandlers?.additionalInfo)) {
                    console.error('Trying to do place a bumped piece without a shape.')
                }
                gameController.placeBumpedPieceOnNode(nodeId, inputHandlers.additionalInfo)
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
                gameController.placeWorkerOnNodeAction(nodeId, inputHandlers.additionalInfo);
            },
            move(nodeId) {
                if (inputHandlers.additionalInfo === 'selectPieceToMove') {
                    gameController.selectPieceToMove(nodeId)
                } else if (inputHandlers.additionalInfo === 'selectLocationToMoveTo') {
                    gameController.movePieceToLocation(nodeId);
                }
            },
            moveToken(nodeId) {
                if (inputHandlers.additionalInfo === 'selectPiece') {
                    gameController.tokenActions.selectMoveThreePiece(nodeId)
                } else if (inputHandlers.additionalInfo === 'selectLocation') {
                    gameController.tokenActions.selectMoveThreeLocation(nodeId)
                } else {
                    console.error(`Unknown additional info: ${inputHandlers.additionalInfo}`)
                }
                console.log('move token action at', nodeId)
            }
        }
    }
    return inputHandlers
}
