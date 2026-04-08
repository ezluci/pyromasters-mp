import './config';

import { readFileSync } from 'fs';
import { WebSocket, WebSocketServer } from 'ws';

import { playerConnect, playerDisconnect } from "./connect-disconnect";
import { processPacket } from "./in-packets/process-packet";
import { tie_isDying } from "./socket-functions/is-dying";
import { tie_bombs } from './socket-functions/bombs';
import { tie_powerups } from "./socket-functions/powerups";
import { setShield, setSick } from "./socket-functions/setters";
import { Room } from './room';
import { tie_kill } from './socket-functions/kill';
import { parseCookie } from 'cookie';
import jwt from 'jsonwebtoken';
import { logger } from './log';


// read sound names and store them in an array. play-sound.ts uses this array.
// the sounds are in the same order as the client.

const soundsFile = readFileSync('../web/public/audiosprite.json', 'utf8');
const soundsJSON = JSON.parse(soundsFile);

export const soundNames: string[] = [];
Object.keys(soundsJSON.sprite).forEach((soundName, index) => {
  soundNames[index] = soundName;
});

export const soundsCount: { [key: string]: number } = {};

soundNames.forEach(soundName => {
  const parts = soundName.split('_');
  if (parts.length > 2) {
    logger.error(`sound name format not good ${soundName}`);
    return;
  }
  if (soundsCount[parts[0]] === undefined) {
    soundsCount[parts[0]] = 0;
  }
  soundsCount[parts[0]] += 1;
});


const rooms = new Map<string, Room>(); // info about all rooms by name
const users = new Map<number, WebSocket>(); // into about all users (by id)

if (!process.env.PORT_SOCKET || !process.env.JWT_SECRET) {
  logger.alert('wrong .env');
  process.exit(1);
}

const server = new WebSocketServer({
  autoPong: false,
  maxPayload: 500_000,
  port: parseInt(process.env.PORT_SOCKET)
}, () => {
  logger.notice(`Socket server listening on port ${process.env.PORT_SOCKET}`);
});

server.on('connection', (sok: WebSocket, req) => {
  sok.lastReceivedPing = performance.now();

  let claims: jwt.JwtPayload | undefined;
  if (req.headers.cookie) {
    const cookies = parseCookie(req.headers.cookie);
    const token = cookies.jwt_token;

    if (token) {
        try {
          claims = jwt.verify(token, process.env.JWT_SECRET!, { algorithms: ['HS256'] }) as jwt.JwtPayload;
        } catch (err) {
          sok.close();
          return;
        }
    }
  }
  
  // process the new player
  playerConnect(req.url, rooms, users, sok, claims);

  // attach setters for some socket properties
  sok.setShield = setShield;
  sok.setSick = setSick;
  
  // attach functions to the sok object
  tie_isDying(sok);
  tie_bombs(sok);
  tie_powerups(sok);
  tie_kill(sok);

  sok.on('message', (data, isBinary) => {
    if (!isBinary || !(data instanceof Buffer)) {
      return;
    }
    processPacket(sok, data);
  });

  sok.on('close', (_code, _reason) => {
    playerDisconnect(rooms, users, sok);
  });
});


// remove dead connections
setInterval(() => {
  rooms.forEach(room => {
    room.players.forEach(sok => {
      if (performance.now() - sok.lastReceivedPing >= 9000) {
        playerDisconnect(rooms, users, sok);
        sok.close();
      }
    });
  });
}, 2000);