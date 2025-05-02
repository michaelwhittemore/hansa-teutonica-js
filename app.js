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
      isInUse: true, // may be an unnecessary field
      isFull: false,
      numberOfPlayers,
      playerArray: {}
    }
    response.send(`Successfully created room ${roomName}`)
  } else {
    // TODO: I think this is the wrong way to use a 400, we should only send an error if the case of invalid values
    response.status(400)
    response.send('Room already exists')
  }

})
// Let's do some testing with manual rooms
roomTrackerMockDB['aFullRoom'] = {isFull: true}
roomTrackerMockDB['aGoodRoom'] = {isFull: false}
app.get("/checkRoom/:roomName", (request, response) => {
  console.log(request.params)
  console.log(request.params.roomName)
  const { roomName } = request.params
  if (!roomTrackerMockDB[roomName]){
    response.json({
      isValidRoom: false,
      errorMessage: 'That room does not exist.'
    })
  } else if (roomTrackerMockDB[roomName].isFull){
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

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});