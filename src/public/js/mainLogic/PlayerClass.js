import { STARTING_BANK, TEST_FREE_TOKENS } from "../helpers/constants.js";

export class Player {
    constructor(params) {
        const { color, name, startingPieces, id, index } = params
        this.id = id;
        this.index = index
        this.color = color;
        this.name = name;
        this.supplySquares = startingPieces;
        // this.supplySquares = 31; // Just for testing
        this.maxActions = 2;
        // this.maxActions = 5; // Just for testing
        this.currentTokens = [];
        // this.currentTokens = [...TEST_FREE_TOKENS] // Just for testing
        this.bankedSquares = STARTING_BANK - startingPieces;
        this.supplyCircles = 1;
        this.bankedCircles = 0;

        this.currentActions = this.maxActions;
        this.currentPoints = 0;

        this.usedTokens = [];
        this.unlockedColors = ['grey'];
        this.maxMovement = 2;
        this.keys = 1;
        this.purse = 3;
        this.unlockArrayIndex = {
            actions: 0,
            purse: 0,
            maxMovement: 0,
            colors: 0,
            keys: 0,
        }
        this.hasCompletedEastWestRoute = false;
    }
}