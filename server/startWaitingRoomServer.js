import { WebSocketServer } from 'ws';
import shortUUID from 'short-uuid';

export const startWaitingRoomServer = (roomTrackerMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const stringData = data.toString()
      messageFromClientHandler(stringData, ws)
      console.log(`received data:${stringData}`);
    });
    // TODO, handle the onclose event
    ws.on('close', (event) => {
      console.log('closed a websocket')
      console.log(event)
    })
  });

  // --------------- Internal room WS APIs---------------------- 
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
    const participantID = shortUUID.generate()
    waitingRoomObject.IDsToSockets[participantID] = socket
    socket.send(JSON.stringify({
      type: 'participantID',
      participantID
    }))
    // dev
    if (Object.keys(roomTrackerMockDB[roomName].playersReadiedObject).length !== 0) {
      socket.send(JSON.stringify({
        type: 'playersReadied',
        playersReadiedObject: roomTrackerMockDB[roomName].playersReadiedObject
      }))
    }

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
    roomTrackerMockDB[roomName].playersReadiedObject[participantID] = {
      playerColor,
      playerName,
      participantID, // not sure if we need this (maybe for removing in the future?)
    }
    // dev
    messageAllInRoom(roomName, JSON.stringify({
      type: 'playersReadied',
      playersReadiedObject: {
        [participantID]: {
          playerColor,
          playerName,
          participantID
        }
      }

    }), participantID)
  }

  const messageAllInRoom = (roomName, message, idToExclude = undefined) => {
    const IDs = Object.keys(waitingRoomToSocketMap[roomName].IDsToSockets)
    IDs.forEach(id => {
      // intentionally using  loose equality as we may need string to number
      // TODO maybe fix this so it's always a string?
      if (id != idToExclude) {
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
}