import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startWaitingRoomServer } from "./server/startWaitingRoomServer.js";

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

app.post("/newRoom", (request, response) => {
  const { numberOfPlayers, roomName } = request.body
  if (!numberOfPlayers || !roomName) {
    const errorMessage = 'Tried to create a new room without number of players or room name.'
    response.status(400)
    response.send(errorMessage)
    return
  }
  // Need to do sanitization here
  if (!roomTrackerMockDB[roomName]) {
    // Happy path, the name doesn't exist
    // May need additional fields
    roomTrackerMockDB[roomName] = {
      isInUse: true, // may be an unnecessary field
      isFull: false,
      numberOfPlayers: parseInt(numberOfPlayers),
      playersWaiting: 0,
      playersReadiedObject: {}
    }
    response.send(`Successfully created room ${roomName}`)
  } else {
    // TODO: I think this is the wrong way to use a 400, we should only send an error if the case of invalid values
    response.status(400)
    response.send('Room already exists')
  }

})

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
// ---------------------------------------------

app.get("/checkRoom/:roomName", (request, response) => {
  const { roomName } = request.params
  if (!roomTrackerMockDB[roomName]) {
    response.json({
      isValidRoom: false,
      errorMessage: 'That room does not exist.'
    })
  } else if (roomTrackerMockDB[roomName].isFull) {
    response.json({
      isValidRoom: false,
      errorMessage: 'That room is already full.'
    })
  } else {
    response.json({
      isValidRoom: true,
    })
  }
})

app.get('/joinRoom/:roomName', (request, response) => {
  const { roomName } = request.params
  console.log(roomTrackerMockDB)
  if (!roomTrackerMockDB[roomName]) {
    console.error(`Attempted to join an unknown room ${roomName}`);
    response.status(404)
    response.send(`A room named "${roomName}" doesn't exist.`)
  } else if (roomTrackerMockDB[roomName].isFull) {
    response.status(400)
    response.send(`The room named "${roomName}" is full.`)
  } else {

    response.json(roomTrackerMockDB[roomName])
    roomTrackerMockDB[roomName].playersWaiting++;
    if (roomTrackerMockDB[roomName].playersWaiting === roomTrackerMockDB[roomName].numberOfPlayers) {
      roomTrackerMockDB[roomName].isFull = true;
    }
  }
})
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});

startWaitingRoomServer(roomTrackerMockDB);