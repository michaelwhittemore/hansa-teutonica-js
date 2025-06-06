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
http://localhost:3000/onlineGame/testRoom1?participantId=anK3A8RVr9G4nY5z7mhEA2
http://localhost:3000/onlineGame/testRoom1?participantId=vUCLAhoLQkMdVi5xTDMGLp


Note that the above link uses the test data that gets populated on the server

* 6/6
    * Chat - add to waiting room and also add colors to player "You" in the main game, also need to test that everything still works with hotseat
        * maybe add waiting room chat under the 'otherParticipants' div? 
            * let's do the left side and add a 'joined' and 'readied' message
            * think I should use participantSettings div - maybe wrap it?
            * once I have those 'joined' and 'readied' I can work on the actual chat component
            * don't forget to call the builder method from helpers - createChatInput.js
            * I'll need to look at the waiting room websocket
            * What happens if you try to chat without setting a name? - I think we will say something like "Unnamed Player 1"
            * need to follow the pattern in the standard game log for making it scrollable and auto jump the messages down - might add a helper function
            * logControllerFactory.js is what we should be following
        * ~~still need to test hotseat~~
        * a~~lso should clear all the comments from the createChatInput file~~
    * Fix the css for the send chat message so that it's not blocking the messages
        * I think this means have a separate container
        * actually it looks like it's already two containers. Maybe just use a different positioning and then the chat box should naturally stack? - it looks fine if I remove 'position: absolute;' but I still need to figure out how to fix it to collapse

    * look at google apps - remember that docker containers are cheaper 

-------------------
Online tasks:
1. Chat - Add it below the player board I think. I think this will be more of a UI challenge than a logic challenge. I think ideally this should be agnostic of the websocket type, should work with either waiting room or the actual game. Remember that the server will need to do sanitizing. 
2. I *REALLY* need to test with 3+ people. Two people assumes that there's a binary between the actor and the person being acted on. For example, the UI in bumping rival pieces. - Now that I have it what should I test?? - start with standard actions. make sure to include bumping and move three (really anything with direct interaction)
3. Try to at least read a little more on hosting a node server on google cloud apps. It might make sense to watch a tutorial at home - https://www.youtube.com/watch?v=JAnB7KyDtH4 for starters
4. Disconnection logic for waiting room. We will need a listener for websocket closing. We will then need to clear the associated socket, decrement the playersWaiting, possibly toggle "isFull", the player if they readied up (remember to differentiate between readied and not readied connections, need to do both), in addition to doing this on the server side, we need to message all other players and have them update their UI's accordingly. Additionally, if the disconnected player was readied up, we will need to make sure to remove them from any storage (I think we store the color).
5. Disconnection from the main game. I guess at the very least we should inform the other players? Not sure how to handle resuming. I think that we will need to tie that to saving/resuming online. I'm hopeful that it won't actually be too bad as we already store everything. I think it will be fairly close to what happens to saving/loading on hotseat. The fact that we can disconnect mid-turn might be a problem, eventually we should consider switching saving to occur after every action (also what about tokens?)
6. Improve the waiting room UI. - At the very least should line up "There is 1 other player in this room." and the "Your Name" form. Maybe also move the "No Other Players Ready" section more to the left? The empty space looks awkward. Perhaps I should also use a better font and add a background color. This feels like I should google UI basics and maybe read a guide or watch a tutorial
* Switch to an actual database instead of a JS Object. I should probably wait until I get hosting decided upon incase I want to use Firebase. I should consider something that I can run on my laptop as well, maybe radix? Maybe lowdb, or sqlite, see https://dev.to/forbeslindesay/choosing-a-node-js-database-498f. Maybe postgres?

General (not online specific) Tasks: 
* Tasks that aren't necessarily online include turn timer, expanding the map, improving the UI (for example adding shading, updating color scheme, button spacing, adding an on hover effect), End game points, hotkeys, as part of expanding the map I will need to add Coellen and the East-West route


honestly maybe I should use side by side tabs for testing? - at least during the two person online scenario 
----------------------------------------
* instead of heroku perhaps I should use Google App Engine? looks like it has a free tier
* Nigel suggesting https://cloud.google.com/run?hl=en for dockerized 

* Should we disable buttons when it's not your turn for online play? I assume we would tie that to advance turn?

DOCKER STUFF
https://www.docker.com/blog/getting-started-with-docker-using-node-jspart-i/
docker container ls 
docker kill CONTAINER_NAME (looks like "docker stop" gives the process some time to stop on its own time)
docker run -p 3000:3000 -p 8080:8080 node-docker

------
* waiting room chat
* clicking away from the color picker should close it as a noop
* maybe allow you to start an online game by simply joining a room?
* add the ability to cancel the online ready-up 
* there's a lot of copy paste between the websocket controllers. Maybe I should add some helpers? While I'm at it, maybe give the websocket logic its own folder
* really need to get better at using the node debugger, maybe try to watch something on it when I'm home
* consider adding a room class to the server (might not make sense when we switch to a real Database)
* refactor the "newRoom" POST route to not use errors (or at least not unless the value fails sanitation)
* waiting room clean up/beautification, look up any color schemes or general prettification advise
# Main Game TODOs #
* clean up all my steps comments (i.e. where I manually wrote out a long list of steps) - only keep if actually explains the logic and should also remove the numbers
* add a method to get node by nodeId?
* endgame points calculation
* clean up all instances of console.log and console.warn
* I actually have references to turnTimer in the code. I should probably do something with that
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
* refactor to only pass player unless absolutely necessary - using playerId is a pain in the ass and problematic - turns out it's kinda important for online play as using a player reference can be a problem
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