import { WebSocketServer } from 'ws';
import shortUUID from 'short-uuid';

export const startWebSocketServer = (roomTrackerMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', (ws, request) => {
    console.log(request.url)
    if (request.url === '/waitingRoom'){
      console.log('Opened a waiting room WS')
    }
    // here!
    // we can break 
    ws.on('message', (data) => {
      const stringData = data.toString()
      messageFromClientHandler(stringData, ws)
      console.log(`received data:${stringData}`);
    });
  });

  const waitingRoomToSocketMap = {}

  const joinedWaitingRoom = (socket, roomName) => {
    console.log(`Within joinedWaitingRoom of ${roomName}`)
    if (!waitingRoomToSocketMap[roomName]) {
      waitingRoomToSocketMap[roomName] = {
        IdsToSockets: {}
      }
    }
    const waitingRoomObject = waitingRoomToSocketMap[roomName]
    const participantId = shortUUID.generate()
    waitingRoomObject.IdsToSockets[participantId] = socket
    socket.send(JSON.stringify({
      type: 'participantId',
      participantId
    }))
    if (Object.keys(roomTrackerMockDB[roomName].playersReadiedObject).length !== 0) {
      socket.send(JSON.stringify({
        type: 'playersReadied',
        playersReadiedObject: roomTrackerMockDB[roomName].playersReadiedObject
      }))
    }

    messageAllInRoom(roomName, JSON.stringify({
      type: 'totalParticipants',
      totalParticipants: Object.keys(waitingRoomObject.IdsToSockets).length
    }))

    socket.on('close', ()=> {
      socketCloseHandler(roomName, participantId)
    })
  }

  const playerReadiedUp = (parsedData) => {
    const {
      playerColor,
      participantId,
      playerName,
      roomName,
    } = parsedData;
    roomTrackerMockDB[roomName].playersReadiedObject[participantId] = {
      playerColor,
      playerName,
      participantId, // not sure if we need this (maybe for removing in the future?)
    }

    messageAllInRoom(roomName, JSON.stringify({
      type: 'playersReadied',
      playersReadiedObject: {
        [participantId]: {
          playerColor,
          playerName,
          participantId
        }
      }

    }), participantId)
    if (Object.keys(roomTrackerMockDB[roomName].playersReadiedObject).length === roomTrackerMockDB[roomName].numberOfPlayers) {
      roomTrackerMockDB[roomName].isPlaying = true;
      messageAllInRoom(roomName, JSON.stringify({
        type: 'allReady',
      }))
    }
    
  }

  const messageAllInRoom = (roomName, message, idToExclude = undefined) => {
    const Ids = Object.keys(waitingRoomToSocketMap[roomName].IdsToSockets)
    Ids.forEach(id => {
      // intentionally using  loose equality as we may need string to number
      // TODO maybe fix this so it's always a string?
      if (id != idToExclude) {
        waitingRoomToSocketMap[roomName].IdsToSockets[id].send(message)
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

  const socketCloseHandler = (roomName, participantId) => {
    // todo add the closed logic
    // dev
    console.log('participantId closed their socket', participantId, roomName)
  }
}


