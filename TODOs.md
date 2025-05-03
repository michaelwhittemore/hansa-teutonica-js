# Play Test Ready Checklist #
* Map replicates the actual gameboard
* Endgame points are calculated and winners are reported
    * need to check all sources of endgame points
* Stendal to Arnheim (The east-west route)
    * Will need a component to communicate winners 
    * Will need a route traversal method when either of these cities are taken
* Coellen special city points
    * Maybe make it collapsible if I'm running out of space? 
    * Need an option when clicking on the city
* Need a settings drop down (Change clicks default) - maybe differentiate between "player" and "client" - client has access to settings, player is a game state concept
* Need the ability to save and resume
* Need to remove the starting 8 tokens from player supply

# TODOs #
* 5/02
    * Online play:
        * Should break this into a few different areas: ~~landing page~~, waiting room, routing, signalling, file structure, and game logic (pretty sure game logic will be the hardest)
        * ~~Landing Page~~
        * When joining an online game, will need to redirect to a waiting room which also lets the client select player name and color
            * **HERE!**
            * As soon as the page loads we need to double check with the server that everything is good
            * Need to learn from the server how many players are there
            * Also need to learn the total number of players who are ready
            * need to distinguish between players supported and current player and ready players
            * Need to give the player the opportunity to add their name and color
            * Need to wait to hear from the server, once the game is full we should then
            redirect to the online tab 
        * Building the server
            * Will need to reorganize the server, probably at the very least give it a folder
            * Read up on express best practices and the MDN HTTP docs
            * The web pages can use FETCH API, I can test with postman
            * I'm eventually going to need to use websockets when the server needs to send messages
            * I may want to hard code additional fixed rooms just for testing
            * I will also need to add the data base. NoSQL might be easier? Regardless, that can probably come later
        * Will need a different route from hotseat
        * will need it's own main.js
        * can we use the same main.html?
        * let's rename main.js -> hotseat.js
        * I think we still initialize everything the same way?
    * maybe start on endgame points calculation?
    * maybe create an account to ask my embarrassingly dumb questions
------
* refactor the "newRoom" POST route to not use errors (or at least not unless the value fails sanitation)
* add currentTurn to the turn tracker or the game history or both  (as in how many turns have elapsed total)
* Update the landing page to include a
* Keyboard shortcuts - will need to track state if you can actually make changes (like to the inputHandler action type), otherwise it's a no-op
* At some point would like to make the tokens into a more readable form - will need a map and use what ever the rule book calls them on page 8
* maybe add a nice 'hover' effect to the pieces? like a shadow or border. The color picker came out well
* Stuff will eventually end up being async. I might need some sort of de-bouncer? Or is that not the correct word?
* TODO! all methods will need to actually pass in the playerId. Probably give inputHandlers a playerId field
* will need to replace the gameController reference in the inputHandlers with an API (which either uses signalling or just straight references it via the logic bundle)
* eventually will need a 'settings' property for things like AUTO_SCROLL and USE_DEFAULT
* consider using dynamic import https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import vs https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import so that I can make main.js *NOT* a module
* consider adding a shadow effect to the pieces
* add installation and run instructions to README
* Host my own sever - need to look up IONOS docs
* consider renaming "inputHandlers" to something more accurate
* add an easy method to clear the board information fields (check where this is already happening)
* I **HATE** how hacky my token coordinate system is - need to use system where we invert the slope and calculate the offset from that instead. Remember that the distance should always be the same, just to write out a simple system of coordinate equations when I get the chance
* add all the game logs to bump - just update a list on bumpInformation
* add a settings button - for the moment really just for the sake of having a drop down, but maybe also add the ability to toggle default mode - also perhaps a collapsible rules doc? token explanation at the very least
* add a cancelSelection button to action bar (only works if you haven't done part of an action like move)
* make nodes hoverable text with their ids as text - tooltip?
* place collapse buttons at the actual edges. Might do some calculations when creating them
* ^^^ need to actually use createDivWithClassAndIdAndStyle in place of document.createElement
* technically, it's legal to swap circles and squares as part of a move action (for two moves)
* make sure that the gameboard is scrollable -- This seems surprisingly hard. It might just make sense to remove the property from the gameboard for the moment
* organize css into sections under comments
* when reorganizing css, use nesting
* replace a lot of the css copy pasta, stuff like centered with flex into utility classes
* refactor the warn and clear - should probably rename it to make it clear it's unrelated to player info
* add chat to game log (only relevant in online play)
* Move some of the gameController copy pasta into it's own methods
* Add a turn timer to the turn tracker
* keyboard short cuts for place and selecting shape
* localStorage (this is for saving game state), sessionStorage is for single tabs
* create a readable form of route id for logging, i.e. "the route between Hamburg and Berlin"
* check all TODOs
* For landing page - have a list of valid colors (no text on white background nonsense)
* Fix the collapsible button and container code to involve less copy-pasta
* write out a game flow document
* maybe rename 'board' --> 'map' in the case of the main game board? I keep confusing it with player board
* ESLINT semi colon - ugh prettier was a hassle, might come back to this

# Stretch Goals (in no particular order) # #
* read https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview MDN guide to brush back up on http knowledge
* when doing online play we will likely need some sort of player validator. We don't want to update actionInfoDiv.innerText for example when its not the player's turn.
~~local storage~~
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
~~add linter~~
* reorganize CSS and methods (just the ordering)
* add images for tokens and parts of the player board (i.e. keys and the book in liber sophia and purses)
* corner case of empty bank and supply when being bumped - technically the player can move their placed pieces
* use a bundler like web pack or vite
* read through mdn's web dev docs for a more generalized refresher https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards
* converting things like game controller and board controller to classes may make it easier to have multiple games running as we don't want them to be singletons - I think that's a bit in the future though, it's only relevant if the game logic is running server side, as long as it all occurs in the client we don't need to worry
* add a github link - I'm sure I can find a nice one somewhere online

// npx nodemon app.js (now I don't have to restart it all the time!)
// collapse all = cmd-k and then cmd-0
// unfold all - cmd-k and then cmd-j
// jump to line number - can click on the goto at the bottom of the page (i.e. "Ln 127, Col 87")