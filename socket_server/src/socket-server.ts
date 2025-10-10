import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';

import { playerConnect, playerDisconnect } from "./connect-disconnect";
import { processPacket } from "./in-packets/process-packet";
import { tie_isDying } from "./socket-functions/is-dying";
import { tie_bombs } from './socket-functions/bombs';
import { tie_powerups } from "./socket-functions/powerups";
import { setShield, setSick } from "./socket-functions/setters";
import { Room } from './room';
import { tie_kill } from './socket-functions/kill';


// read sound names and store them in an array. play-sound.ts uses this array.
// the sounds are in the same order as the client.

const soundsFile = readFileSync(path.join('..', 'web', 'public', 'assets', 'audiosprite.json'), 'utf8');
const soundsJSON = JSON.parse(soundsFile);

export const soundNames: string[] = [];
Object.keys(soundsJSON.sprite).forEach((soundName, index) => {
   soundNames[index] = soundName;
});

export const soundsCount: { [key: string]: number } = {};

soundNames.forEach(soundName => {
   const parts = soundName.split('_');
   if (parts.length > 2) {
      console.error(`sound name format not good ${soundName}`);
      return;
   }
   if (soundsCount[parts[0]] === undefined) {
      soundsCount[parts[0]] = 0;
   }
   soundsCount[parts[0]] += 1;
});


const rooms = new Map<string, Room>(); // info about all rooms by name


dotenv.config({ path: '../.env' });

if (!process.env.PORT_SOCKET) {
   console.error('invalid socket port');
   process.exit(1);
}

const server = new WebSocketServer({
   autoPong: false,
   maxPayload: 500_000,
   port: parseInt(process.env.PORT_SOCKET)
}, () => {
   console.log(`Socket server listening on port ${process.env.PORT_SOCKET}`);
});

server.on('connection', (socket: WebSocket, request) => {
   socket.lastReceivedPing = performance.now();
   
   // process the new player
   playerConnect(request.url, rooms, socket);

   // attach setters for some socket properties
   socket.setShield = setShield;
   socket.setSick = setSick;
   
   // attach functions to the sok object
   tie_isDying(socket);
   tie_bombs(socket);
   tie_powerups(socket);
   tie_kill(socket);

   socket.on('message', (data, isBinary) => {
      if (!isBinary || !(data instanceof Buffer)) {
         return;
      }
      // console.log(String.fromCharCode(data[0]), data);
      processPacket(socket, data);
   })

   socket.on('close', (_code, _reason) => {
      playerDisconnect(rooms, socket);
   });
});


// remove dead connections
setInterval(() => {
   rooms.forEach(room => {
      room.players.forEach(socket => {
         if (performance.now() - socket.lastReceivedPing >= 9000) {
            playerDisconnect(rooms, socket);
            socket.close();
         }
      });
   });
}, 2000);