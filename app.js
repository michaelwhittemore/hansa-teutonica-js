import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startWaitingRoomServer } from "./server/startWaitingRoomServer.js";
import { setUpRoomRoutes } from "./server/roomRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// TODO replace this variable with an actual database
const roomTrackerMockDB = {}

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

// Will need a route to clear the room from storage
setUpRoomRoutes(app, roomTrackerMockDB)

// ------------------------ TEST VALUES -----------------------
roomTrackerMockDB['testRoom1'] = {
  isInUse: true,
  isFull: false,
  numberOfPlayers: 3,
  playersWaiting: 2,
  playersReadiedObject: {
    '0': {
      playerColor: '#4b0082',
      playerName: 'testPlayer1',
      roomName: 'testRoom1',
    }
  }
}

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});

startWaitingRoomServer(roomTrackerMockDB);