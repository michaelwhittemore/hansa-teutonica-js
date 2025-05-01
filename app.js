import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded())

app.get("/", (request, res) => {
  res.sendFile(__dirname + "/public/html/landingPage.html")
});
app.get("/hotseat", (request, res) => {
  res.sendFile(__dirname + "/public/html/main.html")
});
app.get("/waitingRoom", (request, res) => {
  res.sendFile(__dirname + "/public/html/waitingRoom.html")
});

app.post("/newRoom", (request,res) => {
  console.log('request is')
  console.log(request)
  console.warn('body!')
  console.log(request.body)
  res.send('This is the response1')
})

const roomTrackerMockDB = {}

// Here!
// In the future I will absolutely need some kind of database for this, but I'm just going to store it
// locally for the moment.
// The server will need some major refactoring as I get to it

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});