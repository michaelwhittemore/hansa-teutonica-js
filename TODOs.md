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

* 6/22

    * First re-run the load balancer build from scratch, then switch to firebase if it still doesn't work
----------------------
* Broader list
    * Google cloud run
        * Now having issues with websocket, at least I can do purely http plus client stuff
        * Potentially need to do something about https & wss https://stackoverflow.com/questions/54546976/how-to-send-upgrade-handshake-to-websocket-server-from-client-using-ws-npm-mod
        * I get 'Invalid Sec-WebSocket-Accept header' when using postman 
        * also might need to use 'handleUpgrade'
        * maybe try the docker instructions to use SSL? - https://www.reddit.com/r/webdev/comments/v2w9fb/develop_locally_on_https/
        * might also be worth self-signing an SSL (which is actually TLS) cert and using it with node
        * as a last resort I could probably have a different wss vs ws depending on env?? - also will need to run client side. Might have a config http request??
        * Let's see if it runs when using wss on gcloud!
        * https://stackoverflow.com/questions/31338927/how-to-create-securetls-ssl-websocket-server might be worth reading
    * Maybe before I do the websockets I can get it running in my own domain
        * https://cloud.google.com/run/docs/mapping-custom-domains
        * maybe I should look at the example linked by https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless (i.e. "The instructions on this page assume you already have a Cloud Run, Cloud Run functions, or App Engine service running. For the example on this page, we have used the Cloud Run Python quickstart to deploy a Cloud Run service in the us-central1 region. The rest of this page shows you how to set up an external Application Load Balancer that uses a serverless NEG backend to route requests to this service." https://cloud.google.com/run/docs/quickstarts) - 34.111.144.222
        * will want to consider subdomain? 
        * Might be worth asking an LLM 
        * I'm worried about this being 'serverless' https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless
        * I'm pretty sure I'm missing some key part of all this. I think maybe I'm deeply confused on how requests are handled? Like what happens if I go to http://example.com/test?
        * https://cloud.google.com/sdk/gcloud/reference/compute/addresses/create

        * Created [https://www.googleapis.com/compute/v1/projects/hansa-teutonica/regions/us-west1/addresses/testname] - Does the above just let me know what command I've sent? Is it unrelated to by project??


        * **HERE!** TRYING THE LOAD BALANCER
        * SO MAYBE THE load balancer does work?? Let's follow the example fully. Also will need to do SSL
            * https://console.cloud.google.com/security/ccm/list/lbCertificates?inv=1&invt=Ab0YVg&project=hansa-teutonica
            * 34.111.144.222:443 (https port)
            * 34.111.144.222:80 (http port)
            * Maybe I just need to wait on the SSL cert provisioning? 
            * Is it possible I need to modify the https://cloud.google.com/load-balancing/docs/ssl-policies-concepts
            * trying to reach https (34.111.144.222:443) via postman results in an error
            * maybe I should just switch to firebase hosting? 
            * 
    
    * Disconnect for main game
        * How do I want to approach this? I'm seeing of having a 'pause' where no actions can be taken? 
        * Maybe we can do this in the same place as validation??
        * Will need to rebuild the websocket and will need to do online loading
        * I think we will need to fix saving to be the end of an action, not the end of the turn

    * REMINDER THAT I CAN CHECK TODOs if I feel burnt out!
        * Let's start with just using the 'span' helper
        * Also add to README, it's currently outdated


-------------------

**DOCKER STUFF**
npx nodemon --env-file=.env app.js
make sure docker application is running
https://www.docker.com/blog/getting-started-with-docker-using-node-jspart-i/
docker container ls 
docker kill CONTAINER_NAME (looks like "docker stop" gives the process some time to stop on its own time)
docker run --name myTest -p 3000:3000 -p 4080:4080 node-docker
docker kill myTest
docker exec -it $CONTAINER_NAME sh (this runs a shell inside the docker container)

-----------------
**Google Cloud Run**
gcloud run deploy --source . (while in the parent folder)
https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service 
https://hansa-teutonica-js-872836492319.us-west1.run.app
* looks like switching to WSS just means it fails silently
* but also it seems like the code still has WS?? - maybe it's cached? - yep, clearing the cache fixed it
https://cloud.google.com/run/docs/mapping-custom-domains 
-----------------

________
I’m struggling with some rather basic stuff, sorry for the very newbie questions. I’ve been trying to do all this just following the documentation, but I’ve kinda hit a wall.

I’m trying to get a simple project up and running. I have it running locally in a docker container on localhost, I just serve some basic JS/HTML/CSS webpages over html. The server runs node with express and uses https://www.npmjs.com/package/ws for web sockets (I’m doing some basic real time communication between the server and the clients). 

I purchased a domain name from IONOS before I decided on using google cloud run. My assumption was that I could just configure the A or AAAA record from my domain-dns-settings. 

I set up a simple node server following the example of https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service which I can see successfully running at my .us-west1.run.app URL. 

Looking at https://cloud.google.com/run/docs/mapping-custom-domains, it seems like the global external Application Load Balancer was my best bet. I tried following the linked documentation (https://cloud.google.com/load-balancing/docs/https/setup-global-ext-https-serverless) and successfully got my load balancer up and running.

I ran the given gcloud cli commands:
gcloud compute addresses create example-ip \ --network-tier=PREMIUM \ --ip-version=IPV4 \ --global
and
gcloud compute addresses describe example-ip \

--format="get(address)" \

--global

I’ve gotten an IPV4 address, but trying to reach it doesn't give a response.

I have an active, Google-managed SSL certificate that I can see in the gcp Certificate Manager or via the ‘gcloud compute ssl-certificates describe’ command. 

Out of frustration I added a http, port 80 to my frontend and to my surprise it worked. Given that I couldn’t even my server access until I added the http to my load balancer frontend, is it possible my SSL policy details are wrong? I’m just using the GCP default. If I specify https in my browser it seems to automatically downgrade to http. I verified via postman that trying to access my static IP on port 443 just results in an ECONNRESET. 

Any tips on what I should try next? 

Thanks for any help, I feel like I’m probably misunderstanding some core networking concepts here. 
_______
Online tasks:

2. I *REALLY* need to test with 3+ people. Two people assumes that there's a binary between the actor and the person being acted on. For example, the UI in bumping rival pieces. - Now that I have it what should I test?? - start with standard actions. make sure to include bumping and move three (really anything with direct interaction)
3. Ugh, now I need to figure out whether to use app engine or cloud run. It seems that cloud run is probably the preferred solution https://cloud.google.com/appengine/migration-center/run/compare-gae-with-run. Try to at least read a little more on hosting a node server on google cloud apps. It might make sense to watch a tutorial at home - https://www.youtube.com/watch?v=JAnB7KyDtH4 for starters, I think I should be using https://cloud.google.com/appengine/docs/standard/nodejs/building-app vs https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service 
    **Based on the above I think we want to use https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service as an example**

    4. I think I can try getting this repo working on cloud run. 
        * maybe when I test locally it will be more easy to use docker? I think I can set up so I can see the node command line that way https://cloud.google.com/run/docs/testing/local#test_locally
        * https://cloud.google.com/run/docs/testing/local - local testing would help a lot
        * I got the local running and am still seeing the 426, need to do https://cloud.google.com/run/docs/tutorials/local-troubleshooting 
        * **HERE** issues with WSS vs WS, also maybe docker is caching? Need to look further
        * I MIGHT HAVE FIXED IT. it defaulted to 8080 which was also what I was using for my WSS port
    5. Once I finish the above I can work on custom domain. I should also look at subdomain

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
* may want to replace 4080 with a port. I guess we get it from the server via http
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
* NOTE: when the favicon is requested a 404s, chrome doesn't request it again on subsequent refreshes, need to use cmd+shift+r for hard refresh
* convert some of my objects to JS maps
* read https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview MDN guide to brush back up on http knowledge
* potentially add an overarching UI controller which is in charge of gameboard, playerBoard, turnTracker, pointTracker, gameLog, ---- this would mainly be in charge of things like ending turns and initializing and resuming
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

// npx nodemon app.js (now I don't have to restart it all the time!)
// collapse all = cmd-k and then cmd-0
// unfold all - cmd-k and then cmd-j
// jump to line number - can click on the goto at the bottom of the page (i.e. "Ln 127, Col 87")