# Play Test Ready Checklist #
* Map replicates the actual gameboard (i.e. has all the same routes and cities)
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
* Need to add installation instructions to the read me

# TODOs #
http://localhost:3000/onlineGame/testRoom1?participantId=iigJEToZqLT8NCpUukFgfz
http://localhost:3000/onlineGame/testRoom1?participantId=uW2d8XHHZn6SPb3vTak3uW
Note that the above link uses the test data that gets populated on the server

* 5/28
    * **HERE!** Bumping rival pieces
        * logic works, but should fix some of the UI
    * turnTrackerMain - should have something for online play where it check for 'YOU' - can probably use the logicBundle.sessionInfo - will need to edit the html, maybe tie it to page initialization
    * look at google apps. If I really can't get it working, switch to heroku

-------------------
Online tasks:
1. ~~Moving your own pieces - do we message for all pieces or just yours? Might need some minor UI adjustments~~
2. Bumping rival pieces - I think using the free pieces for off turn player shouldn't be too bad given that
we will be using playerId 
* The two relevant methods are bumpPieceFromNode & placeBumpedPieceOnNode
    * maybe I start with signalling for bumpPieceFromNode - might need to include 'bumpInformation' from the game controller
    * will need to change the UI to remove the "Your square has been displaced from Alpha-Zeta-1. You may place 2 squares and 0 circles."
        * this is tied to setUpBumpActionInfo
        * maybe we can only call setUpBumpActionInfo when !isOnlineAction
        * i think the issue is that setUpBumpActionInfo also affects the inputHandler, not just the UI
        * looks like I caused the opposite of what i wanted
        * hmmm looks one of them is correct and one isnt????

3. ~~Upgrading - intuitively I think this should be the easiest of the remaining actions~~
4. Token usage - this will need some sub categories. Will probably want a separate kind of messaging just for clarity (as it's not a player action). 
    **TOKEN LIST** 
    1. fourActions
    2. threeActions - these should be pretty easy
    3. freeUpgrade - let's do the upgrade city side first
    4. moveThree - one of the trickier ones. Need to figure out if we do a message for each or block - I think we do each but need to be aware of the stored token info
    5. switchPost
    6. bonusPost
5. Chatting. A whole new feature! - will need to find some data sanitizer on npm (can just do this server side) - but first should be pretty simple to have the case where we do something like "Alice says: Hello world"

honestly maybe I should use side by side tabs for testing?
----------------------------------------
instead of heroku perhaps I should use Google App Engine? looks like it has a free tier
We still have a lot of copy pasta regarding player turn validation - we should try to move this to its own method
* Should we disable buttons when it's not your turn for online play? I assume we would tie that to advance turn?

* tokenUsageInformation may need to be communicated across the tabs? We will see?  - this is because it's tied to a property of gameController and not a function parameter
* should probably get rid of "Should only send a message if it's a client driven action"



------
* waiting room chat
* maybe allow you to start an online game by simply joining a room?
* add the ability to cancel the online ready-up 
* there's a lot of copy paste between the websocket controllers. Maybe I should add some helpers? While I'm at it, maybe give the websocket logic its own folder
* really need to get better at using the node debugger, maybe try to watch something on it when I'm home
* consider adding a room class to the server (might not make sense when we switch to a real Database)
* refactor the "newRoom" POST route to not use errors (or at least not unless the value fails sanitation)
* waiting room clean up/beautification, look up any color schemes or general prettification advise
# Main Game TODOs #
* add a method to get node by nodeId?
* endgame points calculation
* add currentTurn to the turn tracker or the game history or both (as in how many turns have elapsed total)
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
* NOTE: when the favicon is requested a 404s, chrome doesn't request it again on subsequent refreshes, need to use cmd+shift+r for hard refresh
* convert some of my objects to JS maps
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
* make it so form validation happens real time (as opposed to on submission)
* I am inconsistent in using 'Id' vs 'ID' in variable names

// npx nodemon app.js (now I don't have to restart it all the time!)
// collapse all = cmd-k and then cmd-0
// unfold all - cmd-k and then cmd-j
// jump to line number - can click on the goto at the bottom of the page (i.e. "Ln 127, Col 87")