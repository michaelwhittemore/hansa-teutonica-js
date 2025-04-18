import express from "express";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/html/landingPage.html")});
app.get("/hotseat",  (req, res) => {
    res.sendFile(__dirname + "/public/html/main.html")
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
});