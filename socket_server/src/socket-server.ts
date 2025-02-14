import { Socket } from 'socket.io';


const socketio = require('socket.io');
const http = require('http');
require('dotenv').config({ path: '../.env' });

// this server needs to run through https.
// i use nginx for this.
const server = http.createServer();
const io = new socketio.Server(server, {
   cors: { origin: '*' }
});
// server.listen() is at the end of the file


import { playerJoined } from "./player-joined";
import { Room } from "./room";

import { attachGettersSetters } from "./socket-functions/attach-getters-setters";
import { tie_isDying } from "./socket-functions/is-dying";
import { tie_bombs } from './socket-functions/bombs';
import { tie_powerups } from './socket-functions/powerups';

import { chat as chat_event } from "./events/chat";
import { coords as coords_event } from "./events/coords";
import { disconnect as disconnect_event } from "./events/disconnect";
import { selectColor as selectColor_event } from "./events/select-color";
import { tryStart as tryStart_event } from "./events/try-start";
import { Animation, Color, Coord } from './game-types';


const rooms = new Map<string, Room>(); // info about all rooms by name

io.on('connection', (sok: Socket): void => {

   // process the new player
   playerJoined(sok.handshake.query.userName, sok.handshake.query.roomName, rooms, sok);
   
   // attach getters and setters for easier access to some socket properties
   attachGettersSetters(sok);
   
   // attach functions to the sok object
   tie_isDying(sok);
   tie_bombs(sok);
   tie_powerups(sok);

   // socket events:

   sok.on('chat', (msg) => {
      if (typeof msg !== 'string') {
         return;
      }
      chat_event(msg, sok);
   });

   sok.on('tryStart', (mapName) => {
      if (typeof mapName !== 'string') {
         return;
      }
      tryStart_event(mapName, sok);
   });

   sok.on('selectColor', (newColor) => {
      if (typeof newColor !== 'string' || !Object.values(Color).includes(newColor as Color)) {
         return;
      }
      selectColor_event(newColor as Color, sok);
   });

   sok.on('tryPlaceBomb', () => {
      sok.placeBomb();
   });
   
   sok.on('kickbomb', (bombId, xvel, yvel) => {
      if (typeof bombId !== 'number' || typeof xvel !== 'number' || typeof yvel !== 'number') {
         return;
      }
      sok.kickBomb(bombId, xvel, yvel);
   });

   sok.on('coords', (coords, animState) => {
      if (typeof coords !== 'object' || typeof coords?.x !== 'number' || typeof coords?.y !== 'number' ||
         typeof animState !== 'string' || !Object.values(Animation).includes(animState as Animation)
      ) {
         return;
      }
      coords_event(coords as Coord, animState as Animation, sok);
   });

   sok.on('disconnect', () => {
      disconnect_event(rooms, sok);
   });
});



if (!process.env.PORT_SOCKET) {
   console.error('invalid socket port');
} else {
   server.listen(process.env.PORT_SOCKET);
   console.log(`websocket server on port ${process.env.PORT_SOCKET}`);
}