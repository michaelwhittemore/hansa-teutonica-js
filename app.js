import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { startWebSocketServer } from "./server/webSockets/startWebSocketServer.js";
import { setUpRoomRoutes } from "./server/roomRoutes.js";
import { WebSocketServer } from 'ws';

// Testing dedicated http/https servers
import http from 'http';
import https from 'https';
import fs from 'fs';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = parseInt(process.env.PORT) || 3000;
// SET env with npx nodemon --env-file=.env app.js

// TODO replace this variable with an actual database
const waitingRoomMockDB = {};
const gameRoomMockDB = {};

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
app.get("/onlineGame/:roomName", (request, response) => {
  response.sendFile(__dirname + "/public/html/main.html")

})

// ------------------------ TEST VALUES -----------------------
waitingRoomMockDB['testRoom1'] = {
  isPlaying: false,
  isFull: false,
  numberOfPlayers: 4,
  playersWaiting: 1,
  playersReadiedObject: {
    iigJEToZqLT8NCpUukFgfz: {
      playerColor: '#ff0000',
      playerName: 'Alice',
      participantId: 'iigJEToZqLT8NCpUukFgfz'
    },
    uW2d8XHHZn6SPb3vTak3uW: {
      playerColor: '#ff00ff',
      playerName: 'Bob',
      participantId: 'uW2d8XHHZn6SPb3vTak3uW'
    }
  }
}

// // 3rd player
// waitingRoomMockDB['testRoom1'].playersReadiedObject['anK3A8RVr9G4nY5z7mhEA2'] = {
//   playerColor: '#00fa9a',
//   playerName: 'Claire',
//   participantId: 'anK3A8RVr9G4nY5z7mhEA2',
// }
// // 4th player 
// waitingRoomMockDB['testRoom1'].playersReadiedObject['vUCLAhoLQkMdVi5xTDMGLp'] = {
//   playerColor: '#1e90ff',
//   playerName: 'Phil',
//   participantId: 'vUCLAhoLQkMdVi5xTDMGLp',
// }


// ----------------------------------------

setUpRoomRoutes(app, waitingRoomMockDB)

// Testing http/WSS ---------------------------------------
// HERE!
// DEV
const httpServer = http.createServer(app);

const httpsCredentials = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem')
};

// -------------------
const httpsServer = https.createServer(httpsCredentials, app)
// https://localhost:443/


httpsServer.listen(443, () => {
  console.log(`HTTPS server running at https://localhosts:${433}/`);
})
// --------------------

const wss = new WebSocketServer({ server: httpServer });
startWebSocketServer(wss, waitingRoomMockDB, gameRoomMockDB);

httpServer.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}/`);
})