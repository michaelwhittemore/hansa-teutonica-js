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
      playerReadiedObject: {}
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
  // here! we need to send all the other ready upped players (if this player isn't the first)
  const waitingRoomObject = waitingRoomToSocketMap[roomName]
  // participantID will just be a 0-index value
  const participantID = Object.keys(waitingRoomObject.IDsToSockets).length
  waitingRoomObject.IDsToSockets[participantID] = socket
  socket.send(JSON.stringify({
    type: 'participantID',
    participantID
  }))
  messageAllInRoom(roomName, JSON.stringify({
    type: 'totalParticipants',
    totalParticipants: Object.keys(waitingRoomObject.IDsToSockets).length
  }))
}

const playerReadiedUp = (parsedData) => {
  const {
    playerColor,
    participantID,
    playerName,
    roomName,
  } = parsedData;
  roomTrackerMockDB[roomName].playerReadiedObject[participantID]= {
    playerColor,
    playerName,
    participantID, // not sure if we need this (maybe for removing in the future?)
  }
  // We've stored the data, now we need to send it
  console.log('in playerReadiedUp with parsed data:')
  console.log(parsedData)
  messageAllInRoom(roomName, JSON.stringify({
    type: 'playerReadied',
    playerColor,
    playerName,
    participantID }),participantID)
}

const messageAllInRoom = (roomName, message, idToExclude = undefined) => {
  const IDs = Object.keys(waitingRoomToSocketMap[roomName].IDsToSockets)
  IDs.forEach(id => {
    // intentionally using  loose equality as we may need string to number
    // TODO maybe fix this so it's always a string?
    if (id != idToExclude){
      console.log('ids do not match')
      waitingRoomToSocketMap[roomName].IDsToSockets[id].send(message)
    }
  })
}

const messageFromClientHandler = (messageString, socket) => {
  const parsedData = JSON.parse(messageString)
  switch (parsedData.type) {
    case 'newConnection':
      {
        const roomName = parsedData.roomName;
        console.log('A new websocket from the waiting room!', roomName)
        joinedWaitingRoom(socket, roomName)
        break;
      }
    case 'readyNameAndColor':
      playerReadiedUp(parsedData)
      break;
    default:
      console.error(`Unknown socket message type from client: ${parsedData.type}`)
  }

}