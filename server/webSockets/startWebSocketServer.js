import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketController } from './waitingRoomWebSocketController.js';
import { gameWebSocketController } from './gameWebSocketController.js';

export const startWebSocketServer = (waitingRoomMockDB, gameRoomMockDB) => {
  const socketServer = new WebSocketServer({ port: 4080 });
  const waitingRoomToSocketMap = {};
  const gameRoomToSocketMap = {};
  socketServer.on('connection', (ws, request) => {
    if (request.url === '/waitingRoom') {
      waitingRoomWebSocketController(ws, waitingRoomMockDB, waitingRoomToSocketMap)
    } else if (request.url === '/onlineGame') {
      gameWebSocketController(ws, waitingRoomMockDB, gameRoomToSocketMap, gameRoomMockDB)
    } else {
      console.error(`Unknown WebSocket Path: ${request.url}`)
    }
  });
}


