import { createDivWithClassAndIdAndStyle, createColoredSpanWithText } from "./helpers.js";

export const createScoreModal = (playerArray, winnerArray, victoryType) => {
    console.log(playerArray, winnerArray, victoryType)
    // really really should have some dummy data
    const scoreModal = createDivWithClassAndIdAndStyle([], 'scoreModal')
    // so now we need to create a banner - something like 'playerName won/tied by tiebreaker type'
    let bannerHTML = '';
    if (winnerArray.length > 1) {
        // In this situation we have a tie.
        winnerArray.forEach((player, index) => {
            bannerHTML += createColoredSpanWithText(player.name, player.color)
            const playersLeft = winnerArray.length - index - 1;
            if (playersLeft > 1) {
                bannerHTML += ', '
            } else if (playersLeft === 1) {
                // todo - shouldn't have a comma if only two
                bannerHTML += winnerArray.length === 2 ? ' and ' : ', and '
            }
        })
        bannerHTML += ' tied!';
    } else {
        const winner = winnerArray[0]
        bannerHTML = `${createColoredSpanWithText(winner.name, winner.color)} won`
        if (victoryType) {
            bannerHTML += ` by a ${victoryType} tiebreaker`
        }
        bannerHTML += '!';
    }
    const scoreBanner = createDivWithClassAndIdAndStyle(['banner'], 'scoreModalBanner')
    scoreBanner.innerHTML = `The game has ended. <br> ${bannerHTML}`;
    // HERE!
    // Now we should iterate over all the types of points and create a column for each
    const scoreTable = document.createElement('table')
    const headerRow = document.createElement('tr')

    const tableHeaderTextFields = ['Player', 'Prestige Points', 'Tokens', 'Fully Developed Abilities', 'Coellen Special Area',
        'Controlled Cities', 'Longest Network', 'Total Score']
    tableHeaderTextFields.forEach(field => {
        const header = document.createElement('th')
        header.innerText = field
        headerRow.append(header)
    })
    scoreTable.append(headerRow)
    scoreModal.append(scoreBanner, scoreTable)

    const scoreKeys = ['prestigePoints', 'tokenPoints','abilityPoints', 'coellenPoints', 'controlledCityPoints',
        'networkPoints','totalPoints'];
    playerArray.forEach(player => {
        const playerRow = document.createElement('tr')
        const playerNameCell = document.createElement('td');
        playerNameCell.innerText = player.name
        playerRow.append(playerNameCell);
        scoreKeys.forEach(key => {
            const cell = document.createElement('td')
            cell.innerText = player.playerPointObject[key];
            playerRow.append(cell)
        })
        scoreTable.append(playerRow)
    })

    return scoreModal
}

const fourPlayerWinners = [
    {
        "id": "player-0",
        "index": 0,
        "color": "#ff0000",
        "name": "Alice",
        "supplySquares": 5,
        "bankedSquares": 6,
        "supplyCircles": 1,
        "bankedCircles": 0,
        "maxActions": 2,
        "currentActions": 2,
        "currentPoints": 0,
        "currentTokens": [
            "threeActions",
            "freeUpgrade",
            "threeActions",
            "fourActions",
            "bonusPost",
            "bonusPost",
            "switchPost",
            "moveThree"
        ],
        "usedTokens": [],
        "unlockedColors": [
            "grey"
        ],
        "maxMovement": 2,
        "keys": 1,
        "purse": 3,
        "unlockArrayIndex": {
            "actions": 0,
            "purse": 0,
            "maxMovement": 0,
            "colors": 0,
            "keys": 0
        },
        "playerPointObject": {
            "prestigePoints": 0,
            "tokenPoints": 15,
            "abilityPoints": 0,
            "coellenPoints": 0,
            "controlledCityPoints": 0,
            "networkPoints": 0,
            "totalPoints": 15
        }
    },
    {
        "id": "player-1",
        "index": 1,
        "color": "#0000ff",
        "name": "Bob",
        "supplySquares": 6,
        "bankedSquares": 5,
        "supplyCircles": 1,
        "bankedCircles": 0,
        "maxActions": 2,
        "currentActions": 2,
        "currentPoints": 0,
        "currentTokens": [
            "threeActions",
            "freeUpgrade",
            "threeActions",
            "fourActions",
            "bonusPost",
            "bonusPost",
            "switchPost",
            "moveThree"
        ],
        "usedTokens": [],
        "unlockedColors": [
            "grey"
        ],
        "maxMovement": 2,
        "keys": 1,
        "purse": 3,
        "unlockArrayIndex": {
            "actions": 0,
            "purse": 0,
            "maxMovement": 0,
            "colors": 0,
            "keys": 0
        },
        "playerPointObject": {
            "prestigePoints": 0,
            "tokenPoints": 15,
            "abilityPoints": 0,
            "coellenPoints": 0,
            "controlledCityPoints": 0,
            "networkPoints": 0,
            "totalPoints": 15
        }
    },
    {
        "id": "player-2",
        "index": 2,
        "color": "#008000",
        "name": "Claire",
        "supplySquares": 7,
        "bankedSquares": 4,
        "supplyCircles": 1,
        "bankedCircles": 0,
        "maxActions": 2,
        "currentActions": 2,
        "currentPoints": 0,
        "currentTokens": [
            "threeActions",
            "freeUpgrade",
            "threeActions",
            "fourActions",
            "bonusPost",
            "bonusPost",
            "switchPost",
            "moveThree"
        ],
        "usedTokens": [],
        "unlockedColors": [
            "grey"
        ],
        "maxMovement": 2,
        "keys": 1,
        "purse": 3,
        "unlockArrayIndex": {
            "actions": 0,
            "purse": 0,
            "maxMovement": 0,
            "colors": 0,
            "keys": 0
        },
        "playerPointObject": {
            "prestigePoints": 0,
            "tokenPoints": 15,
            "abilityPoints": 0,
            "coellenPoints": 0,
            "controlledCityPoints": 0,
            "networkPoints": 0,
            "totalPoints": 15
        }
    },
    {
        "id": "player-3",
        "index": 3,
        "color": "#ff1493",
        "name": "Phil",
        "supplySquares": 8,
        "bankedSquares": 3,
        "supplyCircles": 1,
        "bankedCircles": 0,
        "maxActions": 2,
        "currentActions": 2,
        "currentPoints": 0,
        "currentTokens": [
            "threeActions",
            "freeUpgrade",
            "threeActions",
            "fourActions",
            "bonusPost",
            "bonusPost",
            "switchPost",
            "moveThree"
        ],
        "usedTokens": [],
        "unlockedColors": [
            "grey"
        ],
        "maxMovement": 2,
        "keys": 1,
        "purse": 3,
        "unlockArrayIndex": {
            "actions": 0,
            "purse": 0,
            "maxMovement": 0,
            "colors": 0,
            "keys": 0
        },
        "playerPointObject": {
            "prestigePoints": 0,
            "tokenPoints": 15,
            "abilityPoints": 0,
            "coellenPoints": 0,
            "controlledCityPoints": 0,
            "networkPoints": 0,
            "totalPoints": 15
        }
    }
]