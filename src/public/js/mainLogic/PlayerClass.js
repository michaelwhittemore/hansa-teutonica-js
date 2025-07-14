import { STARTING_BANK, TEST_FREE_TOKENS } from "../helpers/constants.js";

export class Player {
    constructor(params) {
        const { color, name, startingPieces, id, index } = params
        this.id = id;
        this.index = index
        this.color = color;
        this.name = name;
        this.supplySquares = startingPieces;
        // this.supplySquares = 50; // Just for testing
        this.bankedSquares = STARTING_BANK - startingPieces;
        this.supplyCircles = 1;
        this.bankedCircles = 0;
        // this.maxActions = 2; // Not to be confused with current actions
        // this.maxActions = 50; // Just for testing
        this.currentActions = this.maxActions;
        this.currentPoints = 0;
        this.currentTokens = []; // TODO Revert this once I'm done testing
        // this.currentTokens = [...TEST_FREE_TOKENS]
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