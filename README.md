# hansa-teutonica-js
Implementing Hansa Teutonica in browser
See a working version on https://hansa.michaelwhittemore.com/
Currently running in a docker container on Google Cloud Run. Everything is done is vanilla JS with limited modules. The node server uses express for routing and websockets for realtime communication with clients. Game logic is handled client side, the server orchestrates room creation and passes messages between clients but has not concept of the game rules. 
The UI is very much a work in progress and hasn't been tested with or designed around mobile browsers. At the moment, it is intended to be played on desktop.

The project can be run locally with docker via the `docker compose watch` command. It will be available on http://localhost:80/

The docker image uses node 24, but it should run on node v20 or greater.

See https://cdn.1j1ju.com/medias/df/af/68-hansa-teutonica-big-box-rulebook.pdf for rules
