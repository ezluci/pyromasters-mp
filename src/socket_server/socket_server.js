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


const playerJoined_event = require('./events/playerJoined.js').playerJoined;
const chat_event = require('./events/chat.js').chat;
const tryStart_event = require('./events/tryStart.js').tryStart;
const selectColor_event = require('./events/selectColor.js').selectColor;
const tryPlaceBomb_event = require('./events/tryPlaceBomb.js').tryPlaceBomb;
const coords_event = require('./events/coords.js').coords;
const disconnect_event = require('./events/disconnect.js').disconnect;


const ROOMS = new Map(); // info about all rooms

io.on('connection', (sok) => {

   // ----- SOCKET METHODS -----

   require('./sok_functions/room_status.js')(io, sok);
   require('./sok_functions/show_end_screen.js')(io, sok);
   require('./sok_functions/details_ok_check.js')(io, sok);
   require('./sok_functions/count_not_dead.js')(io, sok);
   require('./sok_functions/on_deadly_block_check.js')(io, sok);
   require('./sok_functions/collect_powerups.js')(io, sok);
   require('./sok_functions/player-status-handler.js')(io, sok);

   // ----- SOCKET EVENTS -----

   sok.on('playerJoined', (username, room, callback) => {
      playerJoined_event(username, room, callback, io, ROOMS, sok);
   });

   sok.on('chat', (msg) => {
      chat_event(msg, io, sok);
   });

   sok.on('tryStart', () => {
      tryStart_event(io, sok);
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