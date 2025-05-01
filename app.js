import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// TODO replace this variable with an actual database
const roomTrackerMockDB = {}

app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded())

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/html/landingPage.html")
});
app.get("/hotseat", (request, response) => {
  response.sendFile(__dirname + "/public/html/main.html")
});
app.get("/waitingRoom", (request, response) => {
  response.sendFile(__dirname + "/public/html/waitingRoom.html")
});

// Will need a route to clear the room from storage

// Let's plan out this 
app.post("/newRoom", (request, response) => {
  const { numberOfPlayers, roomName } = request.body
  if (!numberOfPlayers || !roomName) {
    console.error('Tried to create a new room without number of players or room name.')
    response.status(400)
    response.send('Tried to create a new room without number of players or room name.')
    return
  }
  console.log(numberOfPlayers, roomName)
  // Need to do sanitization here
  if (!roomTrackerMockDB[roomName]) {
    // Happy path, the name doesn't exist
    // May need additional fields
    roomTrackerMockDB[roomName] = {
      isInUse: true,
      numberOfPlayers,
      playerArray: {}
    }
    response.send(`Successfully created room ${roomName}`)
  } else {
    response.status(400)
    response.send('Room already exists')
  }

})



// Here!
// In the future I will absolutely need some kind of database for this, but I'm just going to store it
// locally for the moment.
// The server will need some major refactoring as I get to it

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});