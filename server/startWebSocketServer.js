import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketController } from './waitingRoomWebSocketController.js';
import { gameWebSocketController } from './gameWebSocketController.js';

export const startWebSocketServer = (roomTrackerMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });
  const waitingRoomToSocketMap = {};
  const gameRoomToSocketMap = {};
  wss.on('connection', (ws, request) => {
    if (request.url === '/waitingRoom') {
      waitingRoomWebSocketController(ws, roomTrackerMockDB, waitingRoomToSocketMap)
    } else if (request.url === '/onlineGame') {
      // dev 
      // need to figure out if the gameWebSocketController actually needs access to the roomTrackerMockDB
      // I assume it does so that the game can be ended and cleared at the very least
      gameWebSocketController(ws, roomTrackerMockDB, gameRoomToSocketMap)
    } else {
      console.error(`Unknown WebSocket Path: ${request.url}`)
    }
  });
}


