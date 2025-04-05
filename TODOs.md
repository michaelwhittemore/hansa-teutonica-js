# TODOs #
* Add token acquisition (FUN!!!!!!)
* Spin up a simple node server and move these to modules -- HERE**IMPORTANT**
    * move things into modules
    * for most development just access main directly from file:///Users/michaelwhittemore/Desktop/repos/hansa-teutonica-js/public/main.html so that I don't need to have the server running -- this may not be possible once I set up modules
* replace the if (IS_HOTSEAT_MODE) {player = this.getActivePlayer()} copypasta with a function
* add a cancelSelection button to action bar (only works if you haven't done part of an action like move)
* make sure all unlocks are on the board, might do the name clean up at the same time
* place collapse buttons at the actual edges. Might do some calulations when creating them
* add the move ability  - will have some issues with both this and the bump ability in that we need to select additional pieces after the move has been initiated. To the click handlers we will need to add a new action type - select piece and select target location will also need to display moves left
* fix the wonkiness in switch (city.unlock){} --- I use like three different names for somethings,
I need to have a single word for each between city unlock, the divs for holding the information on the player board i.e. movesTracker & movesDiv, the player properties, the player.unlockArrayIndex properties, and the unlock array themselves (i.e. unlockPurseToValue & unlockColorsToValue) --> REFACTOR
* ^^^ need to actually use createDivWithClassAndIdAndStyle in place of document.createElement
* add token holder (don't have to make tokens functional)
* re-adding tokens to the board as part of the player's end of turn will need to be a seperate method and code section - will need new input handlers
* bump method, will require some way to track player who needs to take an action, but doesn't have the turn  -- **Next**
* make sure that the gameboard is scrollable -- This seems surprisingly hard. It might just make sense to remove the property from the gameboard for the moment
* organize css into sections under comments
* replace a lot of the css copy pasta, stuff like centered with flex into utility classes
* refactor the warn and clear - should probably rename it to make it clear it's unrelated to player info
* autoscroll to game log
* add chat to game log
* Move some of the gameController copy pasta into it's own methods
* Add a turn timer to the turn tracker
* keyboard short cuts for place and selecting shape
* Fix turn track to place pieces over numbers using a number component with absolute? position
* local storage
* time stamp to game log
* fix the disconnect between variable names in unlockArrayIndex and city.unlocks --- playerInformationAndBoardController.unlockPieceFromBoard is messed up and could be much drier
* create a readable form of route id for logging, i.e. "the route between Hamburg and Berlin"
* check all TODOs
* For landing page - have a list of valid colors (no text on white background nonsense)
* Fix the collapsible button and container code to involve less copy-pasta
* Create a player board that looks like the real one, and allow you to swipe to other players
* write out a game flow document
* maybe rename 'board' --> 'map' in the case of the main game board? I keep confusing it with player board

# Done #
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
* add a favicon
* add linter
* reorganize CSS and methods (just the ordering)
* add images for tokens and parts of the player board (i.e. keys and the book in liber sophia and purses)

// collapse all = cmd-k and then cmd-0
// unfold all - cmd-k and then cmd-j