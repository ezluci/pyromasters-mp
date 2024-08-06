'use strict';


const socketio = require('socket.io');
const http = require('http');
require('dotenv').config();


// this server needs to run through https.
// i use nginx for this.
const server = http.createServer();
const io = new socketio.Server(server, {
   cors: { origin: '*' }
});
// server.listen() is at the end of the file


const playerJoined_event = require('./events/player-joined.js').playerJoined;
const chat_event = require('./events/chat.js').chat;
const tryStart_event = require('./events/try-start.js').tryStart;
const selectColor_event = require('./events/select-color.js').selectColor;
const tryPlaceBomb_event = require('./events/try-place-bomb.js').tryPlaceBomb;
const coords_event = require('./events/coords.js').coords;
const disconnect_event = require('./events/disconnect.js').disconnect;


const ROOMS = new Map(); // info about all rooms

io.on('connection', (sok) => {

   // ----- SOCKET METHODS -----
   // these are some functions that will be attached to the sok object
   require('./sok_functions/room-handler.js')(io, sok);
   require('./sok_functions/show-end-screen.js')(io, sok);
   require('./sok_functions/details-ok-check.js')(io, sok);
   require('./sok_functions/count-not-dead.js')(io, sok);
   require('./sok_functions/on-deadly-block-check.js')(io, sok);
   require('./sok_functions/collect-powerups.js')(io, sok);
   require('./sok_functions/player-status-handler.js')(io, sok);
   require('./sok_functions/generate-map.js')(io, sok);
   require('./sok_functions/bombs.js')(io, sok);
   require('./sok_functions/destroy-room.js')(io, ROOMS, sok);
   require('./sok_functions/place-endgame-block.js')(io, sok);
   require('./sok_functions/run-every-tick.js')(io, sok);

   // ----- SOCKET EVENTS -----

   sok.on('playerJoined', (username, room, callback) => {
      playerJoined_event(username, room, callback, io, ROOMS, sok);
   });

   sok.on('chat', (msg) => {
      chat_event(msg, io, sok);
   });

   sok.on('tryStart', (mapName) => {
      tryStart_event(mapName, io, sok);
   });

   sok.on('selectColor', (newColor) => {
      selectColor_event(newColor, io, sok);
   });

   sok.on('tryPlaceBomb', () => {
      tryPlaceBomb_event(io, sok);
   });

   sok.on('coords', (coords, animState) => {
      coords_event(coords, animState, io, sok);
   });

   sok.on('disconnect', () => {
      disconnect_event(io, ROOMS, sok);
   });
});




server.listen(process.env.PORT_SOCKET);
console.log(`websocket server on port ${process.env.PORT_SOCKET}`);