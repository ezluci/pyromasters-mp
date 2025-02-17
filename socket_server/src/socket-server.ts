import { Server, Socket } from 'socket.io';

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
import { Animation, Color } from './game-types';

import http from 'http';
import dotenv from 'dotenv';
import { readdirSync } from 'fs';
import path from 'path';

dotenv.config({ path: '../.env' });

// this server needs to run through https.
// i use nginx for this.
const server = http.createServer();
const io = new Server(server, {
   cors: { origin: '*' }
});
// server.listen() is at the end of the file


// read sound names and store them in an array. play-sound.ts uses this array
const soundNames: string[] = readdirSync(path.join('..', 'sounds-unbundled', 'sounds'));
export const sounds: { [key: string]: number } = {};

soundNames.forEach(soundName => {
   const parts_1 = soundName.split('.');
   if (parts_1.length !== 2) {
      console.error(`sound name format not good ${soundName}`);
      return;
   }
   const nameFull = parts_1[0];
   const parts_2 = nameFull.split('_');
   if (parts_2.length > 2) {
      console.error(`sound name format not good ${soundName}`);
      return;
   }
   if (typeof sounds[parts_2[0]] !== 'number') {
      sounds[parts_2[0]] = 0;
   }
   sounds[parts_2[0]] += 1;
});


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
         return console.error('wrong chat event');
      }
      chat_event(msg, sok);
   });

   sok.on('tryStart', (mapName) => {
      if (typeof mapName !== 'string') {
         return console.error('wrong trystart event');
      }
      tryStart_event(mapName, sok);
   });

   sok.on('selectColor', (newColor) => {
      if (typeof newColor !== 'string' || !Object.values(Color).includes(newColor as Color)) {
         return console.error('wrong selectcolor event');
      }
      selectColor_event(newColor as Color, sok);
   });

   sok.on('tryPlaceBomb', () => {
      sok.placeBomb();
   });
   
   sok.on('kickbomb', (bombId, xvel, yvel) => {
      if (typeof bombId !== 'number' || typeof xvel !== 'number' || typeof yvel !== 'number') {
         return console.error('wrong kickbomb event');
      }
      sok.kickBomb(bombId, xvel, yvel);
   });

   sok.on('coords', (coords, animState) => {
      if (typeof coords !== 'object' || typeof coords?.x !== 'number' ||
         typeof coords?.y !== 'number' || Object.keys(coords).length !== 2 ||
         typeof animState !== 'string' || !Object.values(Animation).includes(animState as Animation)
      ) {
         return console.error('wrong coords event');
      }
      coords_event(coords, animState as Animation, sok);
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