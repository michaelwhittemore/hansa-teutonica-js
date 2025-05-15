import { WebSocketServer } from 'ws';
import { waitingRoomWebSocketServer } from './waitingRoomWebSocketServer.js';

export const startWebSocketServer = (roomTrackerMockDB) => {
  const wss = new WebSocketServer({ port: 8080 });
  const waitingRoomToSocketMap = {}
  wss.on('connection', (ws, request) => {
    console.log(request.url)
    if (request.url === '/waitingRoom'){
      waitingRoomWebSocketServer(ws, roomTrackerMockDB, waitingRoomToSocketMap)
      console.log('Opened a waiting room WS')
    }
  });
}


