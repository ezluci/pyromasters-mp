'use strict';

require('dotenv').config();
const socketio = require('socket.io')
const fs = require('fs');
const path = require('path')
const express = require('express')

const app = express();

app.use(express.static('./src/client'));

console.log('running on http');
let server = require('http').createServer(app);
server.listen(process.env.PORT_HTTP, () => {
   console.log('http listening on ' + process.env.PORT_HTTP);
});

const io = new socketio.Server(server);

if (process.env.KEY) {
   console.log('running on https');
   const options = {
      cert: fs.readFileSync(process.env.CERT),
      key: fs.readFileSync(process.env.KEY)
   };
   server = require('https').createServer(options, (req, res) => {res.end(`move to http protocol (http://ezluci.com)`);});
   server.listen(process.env.PORT_HTTPS, () => {
      console.log('https listening on ' + process.env.PORT_HTTPS);
   });
}

const {
   BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BLOCK_SIZE, BLOCK_SAFE_PX, MOVE_SPEEDS, FIRE_TIME, ILLNESS_TIME, SHIELD_TIME, BOMB_TIMES,
   BLOCK,
   INEXISTENT_POS, DEFAULT_POS,
   ROOM_STATUS
} = require('./consts')()

function isPowerup(blockCode) {
   return 5 <= blockCode && blockCode <= 13
}

const playerJoined_event = require('./events/playerJoined').playerJoined;
const chat_event = require('./events/chat').chat;
const tryStart_event = require('./events/tryStart').tryStart;
const selectColor_event = require('./events/selectColor').selectColor;
const tryPlaceBomb_event = require('./events/tryPlaceBomb').tryPlaceBomb;
const coords_event = require('./events/coords').coords;
const disconnect_event = require('./events/disconnect').disconnect;

const placeBomb = require('./functions/bombs').placeBomb;
const { getSpeedIndex, setSpeedIndex, getShield, setShield0, setShield1 } = require('./functions/usefulSettersGetters');

const ROOMS = new Map(); // info about all rooms

io.on('connection', (sok) => {



   sok.getRoomStatus = () => {
      return ROOMS.get(sok.room).status;
   }
   sok.setRoomStatus = (status) => {
      io.to(sok.room).emit('room_status', status);
      ROOMS.get(sok.room).status = status;
   }


// -------------- RANDOM FUNCTIONS -------------- (i need to move these in separate files)

   sok.countNotDead = () => {
      let cnt = 0;
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (! ROOMS.get(sok.room)[color].dead)
            cnt++;
      });
      return cnt;
   }

   sok.showEndScreen = () => {
      const ROOM = ROOMS.get(sok.room);
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

      io.to(sok.room).emit('endscreen', winnerColor, ROOM.ranking);
      sok.setRoomStatus(ROOM_STATUS.ENDED);
   }

   sok.detailsOkCheck = () => {
      if (!sok.username) {
         sok.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!ROOMS.get(sok.room)) {
         sok.emit('error', 'Room doesn\'t exist anymore. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!ROOMS.get(sok.room).players.get(sok.username)) {
         sok.emit('error', 'Player is not connected to this room. Refresh the page. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      return true;
   }


   sok.onDeadlyBlockCheck = (color) => {
      const x = ROOMS.get(sok.room)[color].coords.x
      const y = ROOMS.get(sok.room)[color].coords.y
      
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
      if (ROOMS.get(sok.room)[sok.color].bombs < 4)
         ROOMS.get(sok.room)[sok.color].bombs ++
   }

   function collectPowerupBomblength() {
      ROOMS.get(sok.room)[sok.color].bombLength += 2
   }

   function collectPowerupSpeed() {
      let currentIndex = getSpeedIndex(io, ROOMS, sok);
      setSpeedIndex(currentIndex + 1, io, ROOMS, sok);
   }

   function collectPowerupShield() {
      setShield1(io, ROOMS, sok);
   }

   function collectPowerupKickbombs() { // Work In Progress
      
   }

   function collectPowerupBombtime() {
      if (ROOMS.get(sok.room)[sok.color].bombTimeIndex < BOMB_TIMES.length - 1) {
         ROOMS.get(sok.room)[sok.color].bombTimeIndex ++;
      }
   }

   function collectPowerupSwitchplayer() {
      const otherPlayers = [];
      ['white', 'black', 'orange', 'green'].forEach(otherColor => {
         if (ROOMS.get(sok.room)[otherColor].selected && ! ROOMS.get(sok.room)[otherColor].dead && otherColor !== sok.color)
            otherPlayers.push(otherColor);
      });

      if (otherPlayers.length === 0)
         return;
      
      const randIdx = Math.floor(Math.random() * otherPlayers.length);
      const randColor = otherPlayers[randIdx];

      let coordsMe = ROOMS.get(sok.room)[sok.color].coords;
      let coordsYo = ROOMS.get(sok.room)[randColor].coords;
      [coordsMe, coordsYo] = [coordsYo, coordsMe];

      io.to(sok.room).emit('switchPlayers', sok.color, randColor);
   }

   function collectPowerupIllness() {
      const rand = Math.floor(Math.random() * 2);
      
      switch (rand) {
         case 0:
            sok.emit('switchKeys');
            break;
         case 1:
            ROOMS.get(sok.room)[sok.color].sick ++;
            placeBomb(io, ROOMS, sok);
            const id = setTimeout(() => {
               if (ROOMS.get(sok.room)?.[sok.color]?.selected)
                  ROOMS.get(sok.room)[sok.color].sick --;
            }, ILLNESS_TIME);
            ROOMS.get(sok.room).intervalIDS.add(id);

            break;
      }
   }


   sok.collectPowerup = (x, y) => {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(sok.map[y][x])) // 69
         return;
      
      const plr = ROOMS.get(sok.room)[sok.color];

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
      else if (sok.map[y][x] === BLOCK.POWER_ILLNESS) {
         collectPowerupIllness();
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
               collectPowerupIllness();
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
               setSpeedIndex(0, io, ROOMS, sok);
               plr.bombs = 1;
               plr.bombTimeIndex = 0;
               plr.bombLength = 2;
               // plr.kickBombs = 0;  // need event in order to transmit to the player
               setShield0(io, ROOMS, sok);
               io.to(sok.room).emit('playsound', 'bonusLost');
               break;
            case 10: // BonusALL
               setSpeedIndex(2, io, ROOMS, sok);
               plr.bombs = 4;
               plr.bombTimeIndex = 3;
               plr.bombLength = 16;
               // plr.kickBombs = true;
               setShield1(io, ROOMS, sok);
               io.to(sok.room).emit('playsound', 'bonusAll');
               break;
         }
      }
   
      io.to(sok.room).emit('mapUpdates', [{x, y, block: BLOCK.NO}]);
      sok.map[y][x] = BLOCK.NO;
   }

// -------------- SOCKET EVENTS --------------

   sok.on('playerJoined', (username, room, callback) => {
      playerJoined_event(username, room, callback, io, ROOMS, sok);
   });

   sok.on('chat', (msg) => {
      chat_event(msg, io, ROOMS, sok);
   });

   sok.on('tryStart', () => {
      tryStart_event(io, ROOMS, sok);
   });

   sok.on('selectColor', (newColor) => {
      selectColor_event(newColor, io, ROOMS, sok);
   });

   sok.on('tryPlaceBomb', () => {
      tryPlaceBomb_event(io, ROOMS, sok);
   });

   sok.on('coords', (coords, animState) => {
      coords_event(coords, animState, io, ROOMS, sok);
   });

   sok.on('disconnect', () => {
      disconnect_event(io, ROOMS, sok);
   });
});