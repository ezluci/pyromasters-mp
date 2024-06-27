'use strict';


const socketio = require('socket.io');
const fs = require('fs');
const path = require('path');
const http = require('http');
require('dotenv').config();


// this server needs to run through https.
// i use nginx for this.
const server = http.createServer();
const io = new socketio.Server(server, {
   cors: { origin: '*' }
});
// server.listen() is at the end of file



const {
   BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BLOCK_SIZE, BLOCK_SAFE_PX, MOVE_SPEEDS, FIRE_TIME, SICK_TIME_TICKS, SHIELD_TIME_TICKS, BOMB_TIMES,
   BLOCK,
   INEXISTENT_POS, DEFAULT_POS,
   ROOM_STATUS
} = require('./consts.js')()

function isPowerup(blockCode) {
   return 5 <= blockCode && blockCode <= 13
}

const playerJoined_event = require('./events/playerJoined.js').playerJoined;
const chat_event = require('./events/chat.js').chat;
const tryStart_event = require('./events/tryStart.js').tryStart;
const selectColor_event = require('./events/selectColor.js').selectColor;
const tryPlaceBomb_event = require('./events/tryPlaceBomb.js').tryPlaceBomb;
const coords_event = require('./events/coords.js').coords;
const disconnect_event = require('./events/disconnect.js').disconnect;

const placeBomb = require('./functions/bombs.js').placeBomb;
const USG = require('./functions/usefulSettersGetters.js');

const ROOMS = new Map(); // info about all rooms

io.on('connection', (sok) => {



   sok.getRoomStatus = () => {
      return sok.room.status;
   }
   sok.setRoomStatus = (status) => {
      io.to(sok.roomname).emit('room_status', status);
      sok.room.status = status;
   }


// -------------- RANDOM FUNCTIONS -------------- (i need to move these in separate files)

   sok.countNotDead = () => {
      let cnt = 0;
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (! sok.room[color].dead)
            cnt++;
      });
      return cnt;
   }

   sok.showEndScreen = () => {
      const ROOM = sok.room;
      if (!ROOM)
         return;
      
      if (sok.getRoomStatus() !== ROOM_STATUS.RUNNING)
         return;
      
      const notDead = [];
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (!ROOM[color].dead)
            notDead.push(color);
      });

      if (notDead.length >= 2)
         return;

      const winnerColor = notDead[0];

      if (winnerColor) {
         const winnerName = ROOM[winnerColor].sok.username;
         if (!ROOM.ranking[winnerName])
            ROOM.ranking[winnerName] = 0;
         ROOM.ranking[winnerName] ++;
      }

      io.to(sok.roomname).emit('endscreen', winnerColor, ROOM.ranking);
      sok.setRoomStatus(ROOM_STATUS.ENDED);
   }

   sok.detailsOkCheck = () => {
      if (!sok.username) {
         sok.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!sok.room) {
         sok.emit('error', 'Room doesn\'t exist anymore. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!sok.room.players.get(sok.username)) {
         sok.emit('error', 'Player is not connected to this room. Refresh the page. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      return true;
   }


   sok.onDeadlyBlockCheck = (color) => {
      const x = sok.room[color].coords.x
      const y = sok.room[color].coords.y
      
      let deadlyBlock1 = Object.assign(INEXISTENT_POS)
      let deadlyBlock2 = Object.assign(INEXISTENT_POS)

      if (x % BLOCK_SIZE === 0 && y % BLOCK_SIZE === 0) {
         deadlyBlock1 = {x: x / BLOCK_SIZE, y: y / BLOCK_SIZE}
      }
      else if (x % BLOCK_SIZE === 0) {
         const mod = y % BLOCK_SIZE
         
         if (mod > BLOCK_SIZE - BLOCK_SAFE_PX || mod < BLOCK_SAFE_PX) {
            if (mod < BLOCK_SAFE_PX)
               deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE)}
            else
               deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE) + 1}
         } else {
            deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE)}
            deadlyBlock2 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE) + 1}
         }
      } else if (y % BLOCK_SIZE === 0) {
         const mod = x % BLOCK_SIZE
         
         if (mod > BLOCK_SIZE - BLOCK_SAFE_PX || mod < BLOCK_SAFE_PX) {
            if (mod < BLOCK_SAFE_PX)
               deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE), y: y / BLOCK_SIZE}
            else
               deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE) + 1, y: y / BLOCK_SIZE}
         } else {
            deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE), y: y / BLOCK_SIZE}
            deadlyBlock2 = {x: Math.floor(x / BLOCK_SIZE) + 1, y: y / BLOCK_SIZE}
         }
      } else {
         console.log('?????/')
      }

      return ([BLOCK.FIRE, BLOCK.PERMANENT].includes(sok.map[deadlyBlock1.y][deadlyBlock1.x]) ||
            (deadlyBlock2.x !== INEXISTENT_POS.x && [BLOCK.FIRE, BLOCK.PERMANENT].includes(sok.map[deadlyBlock2.y][deadlyBlock2.x])));
   }

// -------------- POWERUP FUNCTIONS -------------- (i need to move these in separate files)

   function collectPowerupBombplus() {
      if (sok.room[sok.color].bombs < 4)
         sok.room[sok.color].bombs ++
   }

   function collectPowerupBomblength() {
      sok.room[sok.color].bombLength += 2
   }

   function collectPowerupSpeed() {
      let currentIndex = USG.getSpeedIndex(io, sok);
      USG.setSpeedIndex(currentIndex + 1, io, sok);
   }

   function collectPowerupShield() {
      USG.setShieldTrue(io, sok);
   }

   function collectPowerupKickbombs() { // Work In Progress
      
   }

   function collectPowerupBombtime() {
      if (sok.room[sok.color].bombTimeIndex < BOMB_TIMES.length - 1) {
         sok.room[sok.color].bombTimeIndex ++;
      }
   }

   function collectPowerupSwitchplayer() {
      const otherPlayers = [];
      ['white', 'black', 'orange', 'green'].forEach(otherColor => {
         if (sok.room[otherColor].selected && ! sok.room[otherColor].dead && otherColor !== sok.color)
            otherPlayers.push(otherColor);
      });

      if (otherPlayers.length === 0)
         return;
      
      const randIdx = Math.floor(Math.random() * otherPlayers.length);
      const randColor = otherPlayers[randIdx];

      let coordsMe = sok.room[sok.color].coords;
      let coordsYo = sok.room[randColor].coords;
      [coordsMe, coordsYo] = [coordsYo, coordsMe];

      io.to(sok.roomname).emit('switchPlayers', sok.color, randColor);
   }

   function collectPowerupSick() {
      const rand = Math.floor(Math.random() * 2);
      if (rand === 0) {
         sok.emit('switchKeys');
      } else {
         USG.setSickTrue(io, sok);
      }
   }


   sok.collectPowerup = (x, y) => {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(sok.map[y][x])) // 69
         return;
      
      const plr = sok.room[sok.color];

      if (sok.map[y][x] === BLOCK.POWER_BOMBPLUS) {
         collectPowerupBombplus();
      }
      else if (sok.map[y][x] === BLOCK.POWER_BOMBLENGTH) {
         collectPowerupBomblength();
      }
      else if (sok.map[y][x] === BLOCK.POWER_SPEED) {
         collectPowerupSpeed();
      }
      else if (sok.map[y][x] === BLOCK.POWER_SHIELD) {
         collectPowerupShield();
      }
      else if (sok.map[y][x] === BLOCK.POWER_KICKBOMBS) {
         collectPowerupKickbombs();
      }
      else if (sok.map[y][x] === BLOCK.POWER_BOMBTIME) {
         collectPowerupBombtime();
      }
      else if (sok.map[y][x] === BLOCK.POWER_SWITCHPLAYER) {
         collectPowerupSwitchplayer();
      }
      else if (sok.map[y][x] === BLOCK.POWER_SICK) {
         collectPowerupSick();
      }
      else if (sok.map[y][x] === BLOCK.POWER_BONUS) {
         const rand = Math.floor(Math.random() * 11);

         switch (rand) {
            case 0:
               collectPowerupBomblength();
               break;
            case 1:
               collectPowerupBombplus();
               break;
            case 2:
               collectPowerupKickbombs();
               break;
            case 3:  case 4:
               collectPowerupSick();
               break;
            case 5:
               collectPowerupSpeed();
               break;
            case 6:
               collectPowerupShield();
               break;
            case 7:
               collectPowerupBombtime();
               break;
            case 8:
               collectPowerupSwitchplayer();
               break;
            case 9: // BonusLOST
               USG.setSpeedIndex(0, io, sok);
               plr.bombs = 1;
               plr.bombTimeIndex = 0;
               plr.bombLength = 2;
               // plr.kickBombs = 0;  // need event in order to transmit to the player
               USG.setShieldFalse(io, sok);
               io.to(sok.roomname).emit('playsound', 'bonusLost');
               break;
            case 10: // BonusALL
               USG.setSpeedIndex(2, io, sok);
               plr.bombs = 4;
               plr.bombTimeIndex = 3;
               plr.bombLength = 16;
               // plr.kickBombs = true;
               USG.setShieldTrue(io, sok);
               io.to(sok.roomname).emit('playsound', 'bonusAll');
               break;
         }
      }
   
      io.to(sok.roomname).emit('mapUpdates', [{x, y, block: BLOCK.NO}]);
      sok.map[y][x] = BLOCK.NO;
   }

// -------------- SOCKET EVENTS --------------

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