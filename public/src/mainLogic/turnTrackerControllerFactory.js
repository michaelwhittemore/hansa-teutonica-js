import { pluralifyText, createDivWithClassAndIdAndStyle } from "../helpers/helpers.js"

export const turnTrackerControllerFactory = () => {
    const turnTrackerController = {
        updateTurnTracker(player) {
            document.getElementById('turnTrackerPlayerName').innerText = player.name
            document.getElementById('turnTrackerPlayerColor').style.color = player.color
            document.getElementById('turnTrackerActions').innerText = pluralifyText('action', player.currentActions)
            document.getElementById('turnTrackerAdditionalInformation').innerHTML = ''
            this.resetTurnTimer()
        },
        updateTurnTrackerWithBumpInfo(props) {
            console.log('updateTurnTrackerWithBumpInfo')
            document.getElementById('turnTrackerAdditionalInformation').innerHTML = ''
            const { bumpedPlayer, bumpingPlayer, circlesToPlace, squaresToPlace } = props
            const bumpInfoDiv = createDivWithClassAndIdAndStyle(['bumpInfo'])
            // Building out the html
            let bumpInfoHTML = `<span style="color: ${bumpingPlayer.color}">${bumpingPlayer.name}</span> `
            bumpInfoHTML += `has displaced <span style="color: ${bumpedPlayer.color}">${bumpedPlayer.name}</span>. `
            bumpInfoHTML += `<span style="color: ${bumpedPlayer.color}">${bumpedPlayer.name}</span> has `
            if (squaresToPlace) {
                bumpInfoHTML += ` ${pluralifyText('square', squaresToPlace)} ${circlesToPlace ? 'and' : ''}`
            }
            if (circlesToPlace) {
                bumpInfoHTML += ' 1 circle '
            }
            bumpInfoHTML += 'left to place on adjacent routes.'

            bumpInfoDiv.innerHTML = bumpInfoHTML;
            document.getElementById('turnTrackerAdditionalInformation').append(bumpInfoDiv)
        },
        updateTurnTrackerWithTokenInfo(player, token, numberOfTokens) {
            console.log('updateTurnTrackerWithTokenInfo called')
            document.getElementById('turnTrackerAdditionalInformation').innerHTML = ''
            const tokenPlacementInfoDiv = createDivWithClassAndIdAndStyle(['tokenPlacementInfo']);
            let tokenPlacementHTML = `<span style="color: ${player.color}">${player.name}</span> `
            tokenPlacementHTML += `can place ${pluralifyText('token', numberOfTokens)} on the board. The currently drawn `
            tokenPlacementHTML += `token is "${token}".`

            tokenPlacementInfoDiv.innerHTML = tokenPlacementHTML;
            document.getElementById('turnTrackerAdditionalInformation').append(tokenPlacementInfoDiv)
        },
        resetTurnTimer() {
            // TODO
        }
    }

    return turnTrackerController;
}
