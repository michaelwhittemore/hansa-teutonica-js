import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { WebSocketServer } from 'ws';

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
  console.log(numberOfPlayers, roomName)
  // Need to do sanitization here
  if (!roomTrackerMockDB[roomName]) {
    // Happy path, the name doesn't exist
    // May need additional fields
    roomTrackerMockDB[roomName] = {
      isInUse: true, // may be an unnecessary field
      isFull: false,
      numberOfPlayers: parseInt(numberOfPlayers),
      playersWaiting: 0,
      playerArray: {}
    }
    response.send(`Successfully created room ${roomName}`)
  } else {
    // TODO: I think this is the wrong way to use a 400, we should only send an error if the case of invalid values
    response.status(400)
    response.send('Room already exists')
  }

})
// Let's do some testing with manual rooms, TODO delete these
roomTrackerMockDB['aFullRoom'] = { isFull: true }
roomTrackerMockDB['aGoodRoom'] = { isFull: false }
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

// ----------------------------- TESTING WEBSOCKETS---------------------------
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  // HERE! 
  // This is pretty important logic, I also need to account for the fact that the actual game logic will 
  // include websockets as well
  // Right now I think we focus on mapping websockets to participants and rooms
  // ~~0.5 switch to big arrow notation for consistency 
  // ~~1. Modify the waiting room to include that it's a waiting room 
  // 1. Need a "newParticipant" method
  // 2. Add an id of roomName + id (maybe just an index?)
  // 3. add a socketMap object to the room in the DB
  // 4. Create a method to inform all participants in a room (something like "messageAllInRoom")
  // 5. Let's start by testing that we can inform the client how many people are in the waiting room
  //  1a. I guess we message "all-others or something to that effect" - when ever someone joins

  ws.on('message', (data) => {
    const stringData = data.toString()
    messageFromClientHandler(stringData, ws)
    console.log(`received data:${stringData}`);
  });
});

// --------------- Internal room WS APIs---------------------- (maybe should be it's own module?)
// Need to add onClose methods
const waitingRoomToSocketMap = {}
const joinedWaitingRoom = (socket, roomName) => {
  console.log(`Within joinedWaitingRoom of ${roomName}`)
  if (!waitingRoomToSocketMap[roomName]) {
    waitingRoomToSocketMap[roomName] = {
      IDsToSockets: {}
    }
  }
  const waitingRoomObject = waitingRoomToSocketMap[roomName]
  // participantID will just be a 0-index value
  const participantID = Object.keys(waitingRoomObject.IDsToSockets).length
  waitingRoomObject.IDsToSockets[participantID] = socket
  // socket.send(`$PARTICIPANT_ID:${participantID}`)
  socket.send(JSON.stringify({
    type: 'participantID',
    participantID
  }))
  // messageAllInRoom(roomName, `$TOTAL_PARTICIPANTS:${Object.keys(waitingRoomObject.IDsToSockets).length}`)
  messageAllInRoom(roomName, JSON.stringify({
    type: 'totalParticipants',
    totalParticipants: Object.keys(waitingRoomObject.IDsToSockets).length
  }))
}

const readiedUp = () => {
  // Will need to parse everything then inform everyone other than the particpant
}

const messageAllInRoom = (roomName, message) => {
  const IDs = Object.keys(waitingRoomToSocketMap[roomName].IDsToSockets)
  IDs.forEach(id => {
    waitingRoomToSocketMap[roomName].IDsToSockets[id].send(message)
  })
}

const messageFromClientHandler = (messageString, socket) => {
  const parsedData = JSON.parse(messageString)
  switch (parsedData.type) {
    case 'newConnection':
      { const roomName = parsedData.roomName;
      console.log('A new websocket from the waiting room!', roomName)
      joinedWaitingRoom(socket, roomName)
      break; }
    case 'readyNameAndColor':
      break;
    default:
      console.error(`Unknown socket message type from client: ${parsedData.type}`)
  }

}