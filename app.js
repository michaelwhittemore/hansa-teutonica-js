import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startWebSocketServer } from "./server/webSockets/startWebSocketServer.js";
import { setUpRoomRoutes } from "./server/roomRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// TODO replace this variable with an actual database
const waitingRoomMockDB = {};
const gameRoomMockDB = {};

app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded())

// Page Routing
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/html/landingPage.html")
});
app.get("/landingPage", (request, response) => {
  response.sendFile(__dirname + "/public/html/landingPage.html")
});
app.get("/hotseat", (request, response) => {
  response.sendFile(__dirname + "/public/html/main.html")
});
app.get("/waitingRoom", (request, response) => {
  response.sendFile(__dirname + "/public/html/waitingRoom.html")
});
app.get("/onlineGame/:roomName", (request, response) => {
  response.sendFile(__dirname + "/public/html/main.html")

})

// ------------------------ TEST VALUES -----------------------
waitingRoomMockDB['testRoom1'] = {
  isInUse: true,
  isPlaying: false,
  isFull: false,
  numberOfPlayers: 3,
  playersWaiting: 1,
  playersReadiedObject: {
    iigJEToZqLT8NCpUukFgfz: {
      playerColor: '#ff0000',
      playerName: 'Alice',
      participantId: 'iigJEToZqLT8NCpUukFgfz'
    },
    uW2d8XHHZn6SPb3vTak3uW: {
      playerColor: '#ff00ff',
      playerName: 'Bob',
      participantId: 'uW2d8XHHZn6SPb3vTak3uW'
    }
  }
}

// Will need a route to clear the room from storage
setUpRoomRoutes(app, waitingRoomMockDB)
startWebSocketServer(waitingRoomMockDB, gameRoomMockDB);

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});