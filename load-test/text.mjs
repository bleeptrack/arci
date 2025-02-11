import config from '../arci-config.json' assert { type: 'json' }
import db from '../db.json' assert { type: 'json' }
import { io } from 'socket.io-client';
import * as https from 'https';
import { SocketAddress } from 'net';

const URL = process.env.URL || `http://localhost:${config['port']}`;
const MAX_CLIENTS = 400;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATION_INTERVAL_IN_MS = 50;
const EMIT_INTERVAL_IN_MS = 1000;
const SESSION_TOKEN = db.sessionToken

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

const createClient = () => {
  // for demonstration purposes, some clients stay stuck in HTTP long-polling
  const transports =
    Math.random() < POLLING_PERCENTAGE ? ["polling"] : ["polling", "websocket"];

  const socket = io(URL, {
    transports,
  });

  socket.emit("player:register", null, SESSION_TOKEN, (response) => {
    console.log(response); 
  })

  socket.on("player:interaction", (msg, callback) => {
    
    https.get(config['test-url'], function(res) {
      if(res.statusCode != 200){
        console.log("Got response: " + res.statusCode);
      }
    }).on('error', function(e) {
      console.log("Got error: " + e.message);
    });
    callback({status: "ok", "from": "load-test"})
  })
  

  setInterval(() => {
    socket.emit("player:loadtest", { message: "test" }, (response) => {
      packetsSinceLastReport++;
    })
  }, EMIT_INTERVAL_IN_MS);

  socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);
  });

  if (++clientCount < MAX_CLIENTS) {
    setTimeout(createClient, CLIENT_CREATION_INTERVAL_IN_MS);
    console.log("created client", clientCount)
  }else{
    console.log("all clients created")
  }
};

createClient();

setInterval(() => {
  console.log("packetsSinceLastReport", packetsSinceLastReport)
  packetsSinceLastReport = 0;
}, 10000);

