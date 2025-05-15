import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketController } from './waitingRoomWebSocketController.js';
import { gameWebSocketController } from './gameWebSocketController.js';

export const startWebSocketServer = (roomTrackerMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });
  const waitingRoomToSocketMap = {};
  const gameRoomToSocketMap = {};
  wss.on('connection', (ws, request) => {
    console.log(request.url)
    if (request.url === '/waitingRoom') {
      waitingRoomWebSocketController(ws, roomTrackerMockDB, waitingRoomToSocketMap)
      console.log('Opened a waiting room WS')
    } else if (request.url === '/onlineGame') {
      gameWebSocketController(ws)
      console.log('Opened a game WS')
    } else {
      console.error(`Unknown WebSocket Path: ${request.url}`)
    }
  });
}


