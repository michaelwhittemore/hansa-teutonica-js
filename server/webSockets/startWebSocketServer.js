import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketController } from './waitingRoomWebSocketController.js';
import { gameWebSocketController } from './gameWebSocketController.js';

export const startWebSocketServer = (waitingRoomMockDB, gameRoomMockDB) => {
  const socketServer = new WebSocketServer({ port: 4080 });
  const waitingRoomToSocketMap = {};
  const gameRoomToSocketMap = {};
  socketServer.on('connection', (ws, request) => {
    switch (request.url) {
      case '/waitingRoom':
        waitingRoomWebSocketController(ws, waitingRoomMockDB, waitingRoomToSocketMap)
        break;
      case '/onlineGame':
        gameWebSocketController(ws, waitingRoomMockDB, gameRoomToSocketMap, gameRoomMockDB)
        break;
      case '/healthCheck':
        // dev
        // todo - this should have it's own file where I can send in messages and get responses
        ws.send('This is a healthy, successful connection.')
        break;
      default:
        console.error(`Unknown WebSocket Path: ${request.url}`)
    }
  });
}


