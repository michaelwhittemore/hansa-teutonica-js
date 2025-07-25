import { createDivWithClassAndIdAndStyle, pluralifyText } from "../helpers/helpers.js"
import { TOKEN_READABLE_NAMES } from "../helpers/constants.js"
import { logicBundle } from "../helpers/logicBundle.js";
import { unlockActionsToValue, unlockColorsToValue, unlockKeysToValue, unlockMovementToValue, unlockPurseToValue } from "../helpers/playerFieldsMaps.js";

export const playerDeskAndInformationControllerFactory = () => {

    const playerDeskAndInformationController = {
        initializePlayerInfoDesks(playerArray) {
            this.playerDesksObj = {}
            playerArray.forEach(player => {
                const playerInfoDesk = this.createInfoDeskForPlayer(player)
                document.getElementById('playerDeskArea').append(playerInfoDesk)
                this.playerDesksObj[player.id] = playerInfoDesk;
            })

            let currentViewingPlayer;
            if (logicBundle.sessionInfo.isHotseatMode) {
                currentViewingPlayer = playerArray[0]
            } else {
                // TODO this may be a separation of concern violation by allowing the inputHandler to 
                // have access to the game controller
                currentViewingPlayer = logicBundle.gameController.getPlayerById(logicBundle.sessionInfo.participantId)
            }
            this.focusOnPlayerDesk(currentViewingPlayer, playerArray)
            // Need to set the focused player before creating buttons
            document.getElementById('playerDeskAreaIncludingButton').prepend(this.createArrowButton('left', playerArray))
            document.getElementById('playerDeskAreaIncludingButton').append(this.createArrowButton('right', playerArray))

            const collapseButton = document.createElement('button');
            collapseButton.innerText = 'Collapse Player Desk';
            collapseButton.className = 'collapseButton';
            collapseButton.onclick = () => this.togglePlayerInfo(collapseButton)
            document.getElementById('playerInfoDeskContainer').append(collapseButton)
            this.isCollapsed = false;
        },
        togglePlayerInfo(collapseButton) {
            // Need to move buttons to append to the playerDeskAreaIncludingButton
            if (!this.isCollapsed) {
                document.getElementById('playerDeskAreaIncludingButton').classList.add('collapsedContainer')
                collapseButton.innerText = 'Expand Player Desk'
            } else {
                document.getElementById('playerDeskAreaIncludingButton').classList.remove('collapsedContainer')
                collapseButton.innerText = 'Collapse Player Desk'
            }
            this.isCollapsed = !this.isCollapsed
        },
        createInfoDeskForPlayer(player) {
            const playerInfoDesk = document.createElement('div')
            playerInfoDesk.style.borderColor = player.color
            playerInfoDesk.className = 'playerInfoDesk'
            playerInfoDesk.id = `${player.id}-infoDesk`

            const playerBanner = document.createElement('div');
            playerBanner.className = 'playerInfoDeskBanner'
            playerBanner.style.color = player.color;
            playerBanner.innerText = player.name;
            playerInfoDesk.append(playerBanner)

            playerInfoDesk.append(this.componentBuilders.createKeysTracker(player))
            playerInfoDesk.append(this.componentBuilders.createTokenTracker(player))
            playerInfoDesk.append(this.componentBuilders.createActionTracker(player))
            playerInfoDesk.append(this.componentBuilders.createColorTracker(player))
            playerInfoDesk.append(this.componentBuilders.createMovesTracker(player))
            playerInfoDesk.append(this.componentBuilders.createPurseTracker(player))
            playerInfoDesk.append(this.componentBuilders.createSupplyTracker(player))
            playerInfoDesk.append(this.componentBuilders.createBankTracker(player));

            return playerInfoDesk
        },
        unlockPieceFromBoard(player, index, unlock) {
            const divId = `${player.id}-${unlock}Div-${index}-shape-locked`
            document.getElementById(divId).remove();
        },
        focusOnPlayerDesk(player, playerArray) {
            this.focusedPlayerIndex = player.index;
            for (let playerId in this.playerDesksObj) {
                if (player.id === playerId) {
                    this.playerDesksObj[playerId].style.display = ''
                } else {
                    this.playerDesksObj[playerId].style.display = 'none'
                }
            }
            for (let arrowButton of document.getElementsByClassName('arrowButton')) {
                const direction = arrowButton.id === ('arrow-left') ? 'left' : 'right'
                this.updateArrowButton(arrowButton, direction, playerArray)
            }
        },
        createArrowButton(direction, playerArray) {
            // TODO test with more than two players
            const arrowButton = createDivWithClassAndIdAndStyle(['arrowButton'], `arrow-${direction}`);
            this.updateArrowButton(arrowButton, direction, playerArray)
            return arrowButton
        },
        updateArrowButton(arrowButton, direction, playerArray) {
            // TODO 
            // We should never ask for the array
            
            let targetPlayerIndex = this.focusedPlayerIndex + (direction === 'left' ? -1 : 1)
            if (targetPlayerIndex < 0) {
                targetPlayerIndex = playerArray.length - 1
            } else {
                targetPlayerIndex = targetPlayerIndex % playerArray.length;
            }
            arrowButton.innerText = `Go ${direction} to ${playerArray[targetPlayerIndex].name}'s board.`
            arrowButton.innerText += direction === 'left' ? '\n <---' : '\n --->'
            arrowButton.style.borderColor = playerArray[targetPlayerIndex].color;

            arrowButton.onclick = () => {
                this.focusOnPlayerDesk(playerArray[targetPlayerIndex], playerArray)
            }

        },
        componentBuilders: {
            createKeysTracker(player) {
                const keysTracker = document.createElement('div')
                keysTracker.className = 'keysTracker';
                keysTracker.id = `${player.id}-keysTracker`;
                for (let i = 0; i < unlockKeysToValue.length; i++) {
                    const keysDiv =createDivWithClassAndIdAndStyle(['keysDiv','deskIndividualUnlock'])
                    keysDiv.innerText = `Key ${unlockKeysToValue[i]}`
                    keysDiv.append(this.createUnlockableShape({
                        locked: i > 0,
                        color: player.color,
                        componentId: `${player.id}-keysDiv-${i}-shape`,
                        shape: 'square',
                    }))
                    keysTracker.append(keysDiv)
                }
                return keysTracker
            },
            createActionTracker(player) {
                const actionTracker = document.createElement('div')
                actionTracker.className = 'actionTracker';
                actionTracker.id = `${player.id}-actionTracker`;
                for (let i = 0; i < unlockActionsToValue.length; i++) {
                    const actionsDiv = document.createElement('div');
                    actionsDiv.classList.add('actionsDiv', 'deskIndividualUnlock')

                    // here! - let's add a text component and the shape
                    const actionsDivText = createDivWithClassAndIdAndStyle(['actionsDivText']);
                    actionsDivText.innerText = `Actiones ${unlockActionsToValue[i]}`
                    actionsDiv.append(actionsDivText)
                    actionsDiv.append(this.createUnlockableShape({
                        locked: i > 0,
                        color: player.color,
                        componentId: `${player.id}-actionsDiv-${i}-shape`,
                        shape: 'square',
                    }))
                    actionTracker.append(actionsDiv)
                }
                return actionTracker;
            },
            createColorTracker(player) {
                const colorTracker = document.createElement('div')
                colorTracker.className = 'colorTracker';
                colorTracker.id = `${player.id}-colorTracker`;

                const colorBanner = document.createElement('div')
                colorBanner.id = 'boardComponentBanner';
                colorBanner.innerText = "Privilegium"
                colorTracker.append(colorBanner);

                for (let i = 0; i < unlockColorsToValue.length; i++) {
                    const colorsDiv = document.createElement('div');
                    colorsDiv.classList.add('colorsDiv', 'centeredFlex')
                    colorsDiv.style.backgroundColor = `${unlockColorsToValue[i]}`
                    colorsDiv.append(this.createUnlockableShape({
                        locked: i > 0,
                        color: player.color,
                        componentId: `${player.id}-colorsDiv-${i}-shape`,
                        shape: 'square',
                        isColors: true,
                    }))
                    colorTracker.append(colorsDiv)
                }
                return colorTracker;
            },
            createMovesTracker(player) {
                const movesTracker = document.createElement('div')
                movesTracker.className = 'movesTracker';
                movesTracker.id = `${player.id}-movesTracker`;

                const movesBanner = document.createElement('div')
                movesBanner.id = 'boardComponentBanner';
                movesBanner.innerText = "Liber Sophiae"
                movesTracker.append(movesBanner);

                for (let i = 0; i < unlockMovementToValue.length; i++) {
                    const maxMovementDiv = document.createElement('div');
                    maxMovementDiv.className = 'maxMovementDiv';
                    const maxMovementDivText = createDivWithClassAndIdAndStyle([])
                    maxMovementDivText.innerText = `${unlockMovementToValue[i]}`;
                    maxMovementDiv.append(maxMovementDivText)
                    maxMovementDiv.append(this.createUnlockableShape({
                        locked: i > 0,
                        color: player.color,
                        componentId: `${player.id}-maxMovementDiv-${i}-shape`,
                        shape: 'circle',
                    }))
                    movesTracker.append(maxMovementDiv)
                }
                return movesTracker
            },
            createPurseTracker(player) {
                const purseTracker = document.createElement('div')
                purseTracker.className = 'purseTracker';
                purseTracker.id = `${player.id}-purseTracker`;
                for (let i = 0; i < unlockPurseToValue.length; i++) {
                    const purseDiv=createDivWithClassAndIdAndStyle(['purseDiv', 'deskIndividualUnlock'])
                    // here! let's center the text
                    purseDiv.innerText = `Resupply ${unlockPurseToValue[i]}`
                    purseDiv.append(this.createUnlockableShape({
                        locked: i > 0,
                        color: player.color,
                        componentId: `${player.id}-purseDiv-${i}-shape`,
                        shape: 'square',
                    }))
                    purseTracker.append(purseDiv)
                }
                return purseTracker;
            },
            createUnlockableShape(props) {
                const { locked, color, componentId, shape, isColors } = props
                const unlockableShape = document.createElement('div')
                unlockableShape.className = isColors ? 'unlockableShapeColors' : 'unlockableShape';
                unlockableShape.id = componentId
                if (shape === 'circle') {
                    unlockableShape.classList.add('circle')
                }
                if (locked) {
                    const lockedShape = document.createElement('div')
                    lockedShape.className = 'lockedShape';
                    lockedShape.id = componentId + '-locked'
                    lockedShape.style.backgroundColor = color
                    unlockableShape.append(lockedShape)
                    if (shape === 'circle') {
                        lockedShape.classList.add('circle')
                    }
                }
                return unlockableShape
            },
            createTokenTracker(player) {
                // eventually add some images for tokens (only need the eaten one)
                const tokenTracker = document.createElement('div');
                tokenTracker.className = 'tokenTracker';
                const tokenHolder = createDivWithClassAndIdAndStyle(['tokenHolder', 'centeredFlex'],
                    `tokenHolder-${player.id}`)
                tokenTracker.append(tokenHolder);
                return tokenTracker
            },
            updateTokenTracker(player, numberOfTokens) {
                const tokenHolderDiv = document.getElementById(`tokenHolder-${player.id}`)
                if (numberOfTokens === 0) {
                    tokenHolderDiv.style.backgroundColor = '';
                    tokenHolderDiv.innerText = ''
                } else {
                    tokenHolderDiv.style.backgroundColor = 'silver';
                    tokenHolderDiv.innerText = numberOfTokens;
                }
            },
            updateSupplyAndBank(player) {
                const supplyTracker = document.getElementById(`supply-pieces-${player.id}`)
                const bankTracker = document.getElementById(`bank-pieces-${player.id}`)
                this.updateSupplyTracker(player, supplyTracker)
                this.updateBankTracker(player, bankTracker)
            },
            updateSupplyTracker(player, supplyTracker) {
                // This feels awful and hacky - probably the result of me misunderstanding 
                // how innerHTML works
                if (!supplyTracker) {
                    supplyTracker = document.getElementById(`supply-pieces-${player.id}`)
                }
                supplyTracker.innerHTML = '';
                for (let i = 0; i < player.supplyCircles; i++) {
                    supplyTracker.append(this.createSupplyOrBankPiece(true, player.color))
                }
                for (let i = 0; i < player.supplySquares; i++) {
                    supplyTracker.append(this.createSupplyOrBankPiece(false, player.color))
                }
            },
            updateBankTracker(player, bankTracker) {
                if (!bankTracker) {
                    bankTracker = document.getElementById(`bank-pieces-${player.id}`)
                }
                bankTracker.innerHTML = '';
                for (let i = 0; i < player.bankedCircles; i++) {
                    bankTracker.append(this.createSupplyOrBankPiece(true, player.color))
                }
                for (let i = 0; i < player.bankedSquares; i++) {
                    bankTracker.append(this.createSupplyOrBankPiece(false, player.color))
                }
            },
            updateTokensInSupplyAndBank(player) {
                const tokenInSupplyDiv = document.getElementById(`supply-tokens-${player.id}`)
                const tokenInSupplyTooltip = document.getElementById(`supply-tokens-tooltip-${player.id}`)
                const currentTokenArray = player.currentTokens;
                document.getElementById(`supply-tokens-text-${player.id}`).innerText = `View ${pluralifyText('available token', currentTokenArray.length)}`

                if (currentTokenArray.length === 0) {
                    tokenInSupplyDiv.style.visibility = 'hidden'
                } else {
                    tokenInSupplyDiv.style.visibility = 'visible'
                }
                let innerSupplyTextString = ''
                currentTokenArray.forEach(token => {
                    innerSupplyTextString += TOKEN_READABLE_NAMES[token] + '\n'
                })
                tokenInSupplyTooltip.innerText = innerSupplyTextString

                const tokenInBankDiv = document.getElementById(`bank-tokens-${player.id}`)
                const tokenInBankTooltip = document.getElementById(`bank-tokens-tooltip-${player.id}`)
                const usedTokenArray = player.usedTokens;
                document.getElementById(`bank-tokens-text-${player.id}`).innerText = `View ${pluralifyText('used token', usedTokenArray.length)}`


                if (usedTokenArray.length === 0) {
                    tokenInBankDiv.style.visibility = 'hidden'
                } else {
                    tokenInBankDiv.style.visibility = 'visible'
                }
                let innerBankTextString = ''
                usedTokenArray.forEach(token => {
                    innerBankTextString += TOKEN_READABLE_NAMES[token] + '\n'

                })
                tokenInBankTooltip.innerText = innerBankTextString
            },
            createSupplyTracker(player) {
                const supplyDiv = createDivWithClassAndIdAndStyle(['supplyArea'], `supply-${player.id}`)
                const supplyBanner = createDivWithClassAndIdAndStyle(['banner'])
                supplyBanner.innerText = 'Supply';
                supplyDiv.append(supplyBanner)
                const supplyPieceTracker = createDivWithClassAndIdAndStyle(['pieceTracker'], `supply-pieces-${player.id}`)
                this.updateSupplyTracker(player, supplyPieceTracker);
                supplyDiv.append(supplyPieceTracker)

                const tokenInSupplyDiv = createDivWithClassAndIdAndStyle(['circle', 'tokenDropdownHolder',
                    'centeredFlex', 'tooltip'], `supply-tokens-${player.id}`)
                const tokenInSupplyDivText = createDivWithClassAndIdAndStyle(['textNode'],
                    `supply-tokens-text-${player.id}`)
                tokenInSupplyDiv.append(tokenInSupplyDivText)
                const tokenInSupplyTooltip = createDivWithClassAndIdAndStyle(['deskTooltipText'],
                    `supply-tokens-tooltip-${player.id}`)
                tokenInSupplyDiv.append(tokenInSupplyTooltip)
                supplyDiv.append(tokenInSupplyDiv)
                return supplyDiv
            },
            createBankTracker(player) {
                // Just copy pasta from createSupplyTracker
                const bankDiv = createDivWithClassAndIdAndStyle(['bankArea'], `bank-${player.id}`)
                const bankBanner = createDivWithClassAndIdAndStyle(['banner'])
                bankBanner.innerText = 'Bank';
                bankDiv.append(bankBanner)
                const bankPieceTracker = createDivWithClassAndIdAndStyle(['pieceTracker'], `bank-pieces-${player.id}`)
                this.updateBankTracker(player, bankPieceTracker);
                bankDiv.append(bankPieceTracker)

                const tokenInBankDiv = createDivWithClassAndIdAndStyle(['circle', 'tokenDropdownHolder',
                    'centeredFlex', 'tooltip'], `bank-tokens-${player.id}`)
                const tokenInBankDivText = createDivWithClassAndIdAndStyle(['textNode'],
                    `bank-tokens-text-${player.id}`)
                tokenInBankDiv.append(tokenInBankDivText)
                const tokenInBankTooltip = createDivWithClassAndIdAndStyle(['deskTooltipText'],
                    `bank-tokens-tooltip-${player.id}`)
                tokenInBankDiv.append(tokenInBankTooltip)
                bankDiv.append(tokenInBankDiv)
                return bankDiv
            },
            createSupplyOrBankPiece(isCircle, color) {
                const piece = createDivWithClassAndIdAndStyle(['tinyPiece'], '',
                    { backgroundColor: color })
                if (isCircle) {
                    piece.classList.add('circle')
                }
                return piece
            },
        },
    }
    logicBundle.playerDeskAndInformationController = playerDeskAndInformationController
    return playerDeskAndInformationController;
    
}
