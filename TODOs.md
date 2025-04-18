# TODOs #
* 4/18
    ~~fix the issue with actions field not updating when getting a free action-upgrade off of the upgrade token~~
    ~~add the bonus point piece to a few cities~~
    ~~trigger end game when anyone reaches twenty~~
    ~~make city pieces the same size as the bonus pieces in cities (go from 30x30 -> 45x45)~~
    ~~move all the helpers ot their own module. Can then break that up at a later date~~
* 4/19
    * move all the other functions into their own files. I'm thinking a 'mainLogic' folder, or somethimng like that
        * Maybe we should given them a factory functin? That way we can pass in things like 
    * clean up this TODOS file a bit
    * have a checklist for this being play-test ready
    * delete my 'Done' field, stopped being satifsying and started being frustrating
    * add slightly more to the landing page, maybe a github link?
    * potentially start looking into localStorage and the ability to save and resume an existiong game
* At some point would like to make the tokens into a more readable form - will need a map and use what ever the rule book calls them on page 8
* consider using dynamic import https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import vs https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import so that I can make main.js *NOT* a module
* consider adding a shadow effect to the pieces
* really do need that linter
* converting things like game controller and board controller to classes may make it easier to have multiple games running as we don't want them to be singletons - I think that's a bit in the future though, it's only relevant if the game logic is running server side, as long as it all occurs in the client we don't need to worry
* add installation and run instructions to README
* Host my own sever - need to look up IONOS docs
* consider renaming "inputHandlers" to something more accurate
* add an easy method to clear the board information fields (check where this is already hapenign)
* I **HATE** how hacky my token coordinate system is - need to use system where we invert the slope and calculate the offset from that instead. Remember that the distance should always be the same, just to write out a simple system of coordinate equations when I get the chance
* Module system **HERE**
* make the toggles more clear what the default does
* add all the game logs to bump - just update a list on bumpInformation
* add a settings button - for the moment really just for the sake of having a drop down, but maybe also add the ability to toggle default mode - also perhaps a collapsable rules doc? token explination at the very least
* replace the if (IS_HOTSEAT_MODE) {player = this.getActivePlayer()} copypasta with a function
* add a cancelSelection button to action bar (only works if you haven't done part of an action like move)
* make nodes hoverable text with their ids as text - tooltip?
* place collapse buttons at the actual edges. Might do some calulations when creating them
* ^^^ need to actually use createDivWithClassAndIdAndStyle in place of document.createElement
* technically, it's legal to swap circles and squares as part of a move action (for two moves)
* make sure that the gameboard is scrollable -- This seems surprisingly hard. It might just make sense to remove the property from the gameboard for the moment
* organize css into sections under comments
* when reoragnizing css, use nesting
* replace a lot of the css copy pasta, stuff like centered with flex into utility classes
* refactor the warn and clear - should probably rename it to make it clear it's unrelated to player info
* add chat to game log
* Move some of the gameController copy pasta into it's own methods
* Add a turn timer to the turn tracker
* keyboard short cuts for place and selecting shape
* localStorage (this is for saving game state), sessionStorage is for single tabs
* fix the disconnect between variable names in unlockArrayIndex and city.unlocks --- playerInformationAndBoardController.unlockPieceFromBoard is messed up and could be much drier
* create a readable form of route id for logging, i.e. "the route between Hamburg and Berlin"
* check all TODOs
* For landing page - have a list of valid colors (no text on white background nonsense)
* Fix the collapsible button and container code to involve less copy-pasta
* Create a player board that looks like the real one, and allow you to swipe to other players
* write out a game flow document
* maybe rename 'board' --> 'map' in the case of the main game board? I keep confusing it with player board

# Done #
~~gamelog autoscrolls on new message~~
~~time stamp to game log~~
~~Bump method~~
~~Place pluralifyText where we use awkward ternary operators in text~~
~~Move action~~
~~BUG!! If you are mid piece move and select a new button i.e. place piece or capture city you can skip resolving the move action, thus cheating out another turn. Let's grey all the other buttons out when mid move~~
~~Update player Bank and supply to use circles and squares~~
~~2D-ify the game board~~
~~Need to add a helper to replace document.create element that should take in id and classArray. Like createDiv()~~
~~style the arrow buttons better~~
~~create individual player boards with the ability to swipe between them~~
~~create the supply and bank area~~
~~make the cities slightly smaller and more square - this is not essential but will increase readability~~
~~supply area~~
~~bank area~~
~~re-add all the wiring for functionality (like taking off pieces when upgrading and updating the supply)~~
~~it looks like we need another container to collapse for the buttons~~
~~Should we center the action on active player??? maybe during hotseat play!~~
~~add the collapse button back~~
~~create info dump area at bottom on board~~
~~add player name banner to the top~~
~~Create "liber sophiae" and purse~~
~~add colors to game log based on player name --> here~~
~~implement upgrade methods before move method (remember that upgrades give free pieces)~~
~~add a "Use defaults" constant~~
~~Add a collapsible game log~~
~~Add upgrades~~
~~ Add a action clarification area below the button bar (i.e. select, square vs circle, warn when trying to take an illegal action, select token via drop down)~~
~~Add some extra routes and cities to play with~~
~~Create the click handlers for place and capture and resupply~~
~~Create a globalized process turn method (checks player actions and legality) and bumps the action/turn~~
~~And onclick buttons to cities and bind them like routes~~
~~Handler should include the Player Information updating~~
~~Add Button click handlers when initializing the game~~
~~Add Some margins to the components~~
~~Capture cities~~
~~Add a city UI update~~
~~ NEED TO COllapse routeNodeStorageObject & routeStorageObject into a single object~~
~~ Add a controlled by field to the city (determined by first majority then right-most)~~
~~ Track points on city capture~~
~~ create nice little first the twenty tracker~~
~~Move this todo list to a text file and clean up some comments~~
~~default behavior when place is clicked but shape not selected~~


# Stretch Goals (in no particular order) # #
* when doing online play we will likely need some sort of player validator. We don't want to update actionInfoDiv.innerText for example when its not the player's turn.
* local storage
* potentially add an overarching UI controller which is in charge of gameboard, playerBoard, turnTracker, pointTracker, gameLog, ---- this would mainly be in charge of things like ending turns and initializing and resuming
* add an end game calculator
* eventually, using 'this' is going to be preferable to referencing the gameController object as there may be more than one - will need a lot of clean up
* resume game,
* landing page 
* keyboard short cuts
* mouse over text for player fields
* refactor some methods to be separate helper functions 
* convert to TS
* add a very stupid single plyer mode 
* maybe move things like routes and cities to their own classes
* refactor to only pass player unless absolutely necessary - using playerId is a pain in the ass and problematic
* undo action button 
* track game logic server side (only for online non-hotseat modes)
* unit tests for all internal methods
~~add a favicon~~
* add linter
* reorganize CSS and methods (just the ordering)
* add images for tokens and parts of the player board (i.e. keys and the book in liber sophia and purses)
* corner case of empty bank and supply when being bumped - technically the player can move their placed pieces
* use a bundler like web pack or vite
* read through mdn's web dev docs for a more generalized refresher https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards

// collapse all = cmd-k and then cmd-0
// unfold all - cmd-k and then cmd-j
// jump to line number - can click on the goto at the bottom of the page (i.e. "Ln 127, Col 87")