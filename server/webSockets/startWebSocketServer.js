import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketController } from './waitingRoomWebSocketController.js';
import { gameWebSocketController } from './gameWebSocketController.js';

export const startWebSocketServer = (waitingRoomMockDB, gameRoomMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });
  const waitingRoomToSocketMap = {};
  const gameRoomToSocketMap = {};
  wss.on('connection', (ws, request) => {
    if (request.url === '/waitingRoom') {
      waitingRoomWebSocketController(ws, waitingRoomMockDB, waitingRoomToSocketMap)
    } else if (request.url === '/onlineGame') {
      gameWebSocketController(ws, waitingRoomMockDB, gameRoomToSocketMap, gameRoomMockDB)
    } else {
      console.error(`Unknown WebSocket Path: ${request.url}`)
    }
  });
}


