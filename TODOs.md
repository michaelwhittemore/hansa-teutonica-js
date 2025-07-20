# Play Test Ready Checklist #
* Map replicates the actual gameboard (i.e. has all the same routes and cities)
* ~~Endgame points are calculated and winners are reported~~
* ~~Stendal to Arnheim (The east-west route)~~
* ~~Coellen special city points~~
* Need a settings drop down (Change clicks default) - maybe differentiate between "player" and "client" - client has access to settings, player is a game state concept
~~* Need the ability to save and resume (locally)~~
* Need to remove the starting 8 tokens from player supply
    * Just reset all the player fields (tokens, starting supply, and maxActions)
~~* Need to add installation instructions to the read me~~
~~* Need it to run on https on my personal site~~

# TODOs #
http://localhost:3000/onlineGame/testRoom1?participantId=iigJEToZqLT8NCpUukFgfz
http://localhost:3000/onlineGame/testRoom1?participantId=uW2d8XHHZn6SPb3vTak3uW
http://localhost:3000/onlineGame/testRoom1?participantId=anK3A8RVr9G4nY5z7mhEA2
http://localhost:3000/onlineGame/testRoom1?participantId=vUCLAhoLQkMdVi5xTDMGLp

Note that the above links use the test data that gets populated on the server in app.js

* 7/20
    * **HERE!**
        * Then take a look at either TODOs or UI thoughts
        * Really need to clean up the action selection/button/warning text area
            * The fact it can be shifted and isn't a set size feels terrible
            * Let's try and figure out all the situations that cause it to be re-sized
                1. Warn invalid action `warningText`
                2. `actionInfo` Does *NOT* move, we should follow its example
                3. `tokenMenu` - this is what I was thinking about replacing action menu with 
            * Maybe for tokens we can replace the action button menu (plus add a cancel)
            * Note that `actionInfo`, `tokenMenu`, and `warningText` are all part of main.html
            * Should I start by styling the buttons first?

    * I think I'm actually done with Endgame points. I'm very close to having the game in a playable state 
        * Then it's just play testing and UI (until eventually working on disconnect logic) 
            - Also I have a *LOT* of outstanding 'todos'
        * I would also like to have the room removed from the server when the game ends


    * In the longer term, I'd like to switch my website to have hansa as a subdomain. Building a polished main website is an important todo for me, although it's beyond the scope of this project. - I should probably look at some templates
        * Perhaps I should start on my portfolio?
        * Am thinking of using Vue
        * I'll need to link to the subdomain
        * Need to figure out a cheaper hosting solution. Maybe try firebase? 

     * https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2021/02/pxl_20210227_230002949.jpg?ssl=1 looks like it might be sufficient

---------------------
* # UI Thoughts
    * Style the board scrollbar
    * The button area has been very neglected (as in player actions)
        * Buttons should have spacing. 
        * We shouldn't shift up and down when error or additional context is added
        * I believe this is the domain of the `actionBar` which I haven't really thought about since I started this project
        * Shouldn't delete / re-add the warning. 
        * Maybe tokens and actions and action clarification (like shapes) should have different styling?
    * Add dashes between route nodes (which will require angular calculation)
    * bonus trading post has a border, maybe add the same to the city pieces so they line up??
    * Player Desk UI: 
        * ~~`Liber Sophiae`, `Privilegium`, and `Resupply` don't line up~~
        - Fixed that but maybe they should all be the same height?? 
        - ~~give them inner padding I think - or maybe actually just redistribute space around the elements - `justify-content: space-evenly`~~
        * Also maybe a border??
        * `actionsDiv` should be centered
        * technically same with keys. 
        * ~~Center the desk elements - playerDeskArea~~
        * Fix squishing when the supply/bank is full
            - 4 per player color (wooden disks)
            - 27 per player color (wooden cubes)
            - Need to account for tokens 
            - Maybe increase the size of the bank/supply? remove some padding in the desk
    * ~~perhaps we use a thicker font for city names, and less thick for unlocks~~
    * ~~cities change border color based on owner~~
    * switch to something slightly gothic or cursive. Unfortunately, the default cursive is kinda garish
    * add a hover effect similar to what we have in the color selector
    * The background-color should be fixed, white is pretty hard to read
    * UI related - maybe we want to automatically start scrolled to the top? To avoid elements being mispositioned? Also maybe we specify the height of the gameBoard? This will probably be worth stack overflow/reddit. The height is already set. The idea is I don't want it to infinitely scroll (not literally, it's just way too much right now) because of the elements before they are transformed? I wonder if switching from `transform: translate` to `left/top` would solve the issue? might be worth a simple test case - looks like maybe scrollHeight?? https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight

----------------------
* Broader list
    * Add a database. Perhaps I should research which one is most in demand for developers? This is just for learning after all. 
    * should I log if the game will end this turn?
    * Disconnect for main game
        * How do I want to approach this? I'm thinking of having a 'pause' where no actions can be taken? 
        * Maybe we can do this in the same place as validation??
        * Will need to rebuild the websocket and will need to do online loading
        * I think we will need to fix saving to be the end of an action, not the end of the turn

    * REMINDER THAT I CAN CHECK TODOs if I feel burnt out!
        * Let's start with just using the 'span' helper
        * Also add to README, it's currently outdated - include docker information and description of the stack
--------------------------

**DOCKER STUFF**
`npx nodemon --env-file=.env src/app.js`
make sure docker application is running
https://www.docker.com/blog/getting-started-with-docker-using-node-jspart-i/
https://docs.docker.com/get-started/introduction/develop-with-containers/
* should try following https://github.com/docker/getting-started-todo-app/blob/main/Dockerfile for compose watch
docker container ls 
`docker build --tag image1 .` - builds the image (replace the name as you see fit)
docker ps (short for process status) 
docker kill CONTAINER_NAME (looks like "docker stop" gives the process some time to stop on its own time)
docker run --name onePortTest -p 80:80 image1
docker kill myTest
docker exec -it $CONTAINER_NAME sh (this runs a shell inside the docker container)
`docker run --name not-gcp-test -p 80:80 image1`
**Instructions to run docker compose and watch it:** 
    1. `docker compose watch` (Make sure it succeeds, may need to remove if the port is being shared by the old one)
    2. In a new tab, `docker compose logs -f  hansa-server` (Note that "hansa-server" is the name given to the service in compose.yaml)
    3. Stop with docker compose down 


-----------------
**Google Cloud Run**
`gcloud run deploy --source .` (while in the parent folder)
https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service 
https://hansa-teutonica-js-872836492319.us-west1.run.app
https://cloud.google.com/run/docs/mapping-custom-domains 
* `PORT=8080 && docker run --name gcpTest -p 9090:${PORT} -e PORT=${PORT} node-dockerImage-6/23` (This the command linked for locally testing GCR with my image name https://cloud.google.com/run/docs/testing/local#docker), it then is access via http://localhost:9090/, also I added the --name

-----------------

Online tasks:

2. I *REALLY* need to test with 3+ people. Two people assumes that there's a binary between the actor and the person being acted on. For example, the UI in bumping rival pieces. - Now that I have it what should I test?? - start with standard actions. make sure to include bumping and move three (really anything with direct interaction)

5. Disconnection from the main game. I guess at the very least we should inform the other players? Not sure how to handle resuming. I think that we will need to tie that to saving/resuming online. I'm hopeful that it won't actually be too bad as we already store everything. I think it will be fairly close to what happens to saving/loading on hotseat. The fact that we can disconnect mid-turn might be a problem, eventually we should consider switching saving to occur after every action (also what about tokens?)
6. Improve the waiting room UI. - At the very least should line up "There is 1 other player in this room." and the "Your Name" form. Maybe also move the "No Other Players Ready" section more to the left? The empty space looks awkward. Perhaps I should also use a better font and add a background color. This feels like I should google UI basics and maybe read a guide or watch a tutorial
* Switch to an actual database instead of a JS Object. I should probably wait until I get hosting decided upon incase I want to use Firebase. I should consider something that I can run on my laptop as well, maybe radix? Maybe lowdb, or sqlite, see https://dev.to/forbeslindesay/choosing-a-node-js-database-498f. Maybe postgres?

General (not online specific) Tasks: 
* Tasks that aren't necessarily online include turn timer, expanding the map, improving the UI (for example adding shading, updating color scheme, button spacing, adding an on hover effect), End game points, hotkeys, as part of expanding the map I will need to add Coellen and the East-West route


honestly maybe I should use side by side tabs for testing? - at least during the two person online scenario 
----------------------------------------

* Should we disable buttons when it's not your turn for online play? I assume we would tie that to advance turn?



------
* maybe allow you to start an online game by simply joining a room?
* pressing 'enter' should send chat message - also sanitize
* there's a lot of copy paste between the websocket controllers. Maybe I should add some helpers? While I'm at it, maybe give the websocket logic its own folder
* really need to get better at using the node debugger, maybe try to watch something on it when I'm home
* consider adding a room class to the server (might not make sense when we switch to a real Database)
* refactor the "newRoom" POST route to not use errors (or at least not unless the value fails sanitation)
* waiting room clean up/beautification, look up any color schemes or general prettification advise
* may want to replace 80 with a port. I guess we get it from the server via http
# Main Game TODOs #
* add createColoredSpanWithText to places where I write out the html string
* clean up all my steps comments (i.e. where I manually wrote out a long list of steps) - only keep if actually explains the logic and should also remove the numbers
* add a method to get node by nodeId?
* endgame points calculation
* load game fails if there's no local storage
* clean up all instances of console.log and console.warn
* I actually have references to turnTimer in the code. I should probably do something with that
* add currentTurn to the turn tracker or the game history or both (as in how many turns have elapsed total)
* Keyboard shortcuts - will need to track state if you can actually make changes (like to the inputHandler action type), otherwise it's a no-op
* At some point would like to make the tokens into a more readable form - will need a map and use what ever the rule book calls them on page 8
* maybe add a nice 'hover' effect to the pieces? like a shadow or border. The color picker came out well
* Stuff will eventually end up being async. I might need some sort of de-bouncer? Or is that not the correct word?
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
* Fix the collapsible button and container code to involve less copy-pasta
* write out a game flow document
* maybe rename 'board' --> 'map' in the case of the main game board? I keep confusing it with player board
* ESLINT semi colon - ugh prettier was a hassle, might come back to this

# Stretch Goals (in no particular order) # #
* switch to a cdn for static assets - apparently it's cheaper and more performant?
* NOTE: when the favicon is requested a 404s, chrome doesn't request it again on subsequent refreshes, need to use cmd+shift+r for hard refresh
* convert some of my objects to JS maps
* read https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview MDN guide to brush back up on http knowledge
* potentially add an overarching UI controller which is in charge of gameboard, playerDesk, turnTracker, pointTracker, gameLog, ---- this would mainly be in charge of things like ending turns and initializing and resuming
* add an end game calculator
* eventually, using 'this' is going to be preferable to referencing the gameController object as there may be more than one - will need a lot of clean up
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
* Maybe switch to nginx - seems like a useful application to know 

// collapse all = cmd-k and then cmd-0 (that's a zero)
// unfold all - cmd-k and then cmd-j
// jump to line number - can click on the goto at the bottom of the page (i.e. "Ln 127, Col 87")