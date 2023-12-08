'use strict';

const PORT = process.env.PORT || 3000;
const socketio = require('socket.io')
const http = require('http');
const path = require('path')
const express = require('express')

const app = express();

app.use(express.static('./src/client'));


const server = http.createServer(app);
server.listen(PORT, () => {
   console.log('Listening on ' + PORT);
});

const {
   BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BLOCK_SIZE, BLOCK_SAFE_PX, MOVE_SPEEDS, FIRE_TIME, ILLNESS_TIME, SHIELD_TIME, BOMB_TIMES,
   BLOCK,
   INEXISTENT_POS, DEFAULT_POS,
   ROOM_STATUS, END_SCREEN_TIMEOUT
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

const explodeBomb = require('./functions/explodeBomb').explodeBomb;

const io = new socketio.Server(server);

const ROOMS = new Map(); // info about all rooms

io.on('connection', (sok) => {

   sok.intervalIDS = new Set();

   // useful getters and setters

   sok.getSpeedIndex = () => {
      return ROOMS.get(sok.room)[sok.color].moveSpeedIndex;
   }
   sok.setSpeedIndex = (index) => {
      if ( !(0 <= index && index < MOVE_SPEEDS.length) )
         return;
      ROOMS.get(sok.room)[sok.color].moveSpeedIndex = index;
      sok.emit('speedUpdate', MOVE_SPEEDS[index]);
   }

   sok.getShield = () => {
      return ROOMS.get(sok.room)[sok.color].shield;
   }
   sok.setShield0 = () => {
      const plr = ROOMS.get(sok.room)[sok.color];
      if (plr.shieldTimeout) {
         clearTimeout(plr.shieldTimeout);
      }

      io.to(sok.room).emit('shield0', sok.color);
      plr.shield = false;
   }
   sok.setShield1 = () => {
      const plr = ROOMS.get(sok.room)[sok.color];
      if (plr.shieldTimeout) {
         clearTimeout(plr.shieldTimeout);
      }

      io.to(sok.room).emit('shield1', sok.color);
      plr.shield = true;
      plr.shieldTimeout = setTimeout(() => {
         if (plr)
            plr.shield = false;
      }, SHIELD_TIME);
      sok.intervalIDS.add(plr.shieldTimeout);
   }

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
         const winnerName = ROOM[winnerColor].username;
         if (!ROOM.ranking[winnerName])
            ROOM.ranking[winnerName] = 0;
         ROOM.ranking[winnerName] ++;
      }

      io.to(sok.room).emit('endscreen', winnerColor, ROOM.ranking);
      sok.setRoomStatus(ROOM_STATUS.ENDED);
   }

   sok.detailsOkCheck = () => {
      if (!sok.username) {
         sok.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted, or the server was restarted mid-game. DISCONNECTED.')
         sok.disconnect()
         return false
      }
      return true
   }

   sok.placeBomb = () => {
      if (!sok.detailsOkCheck())
         return;
      
      if (sok.color === 'spectator')
         return sok.emit('error', 'tryPlaceBomb: You are a spectator.');
      if (ROOMS.get(sok.room)[sok.color].dead)
         return sok.emit('error', 'tryPlaceBomb: You are \'dead\'');
      
      const x = Math.round(ROOMS.get(sok.room)[sok.color].coords.x / BLOCK_SIZE);
      const y = Math.round(ROOMS.get(sok.room)[sok.color].coords.y / BLOCK_SIZE);
      
      if ( !(0 <= x && x <= BLOCKS_HORIZONTALLY && 0 <= y && y <= BLOCKS_VERTICALLY) )
         return sok.emit('error', 'tryPlaceBomb: x or y out of range.');
      
      if (sok.map[y][x] === BLOCK.FIRE || sok.map[y][x] === BLOCK.BOMB || sok.map[y][x] === BLOCK.PERMANENT || sok.map[y][x] === BLOCK.NORMAL)
         return;
      
      if (ROOMS.get(sok.room)[sok.color].bombs === 0)
         return; // no bombs left
      
      // placing the bomb
      io.to(sok.room).emit('mapUpdates', [{x, y, block: BLOCK.BOMB, details: {sick: ROOMS.get(sok.room)[sok.color].sick}}]);
      sok.map[y][x] = BLOCK.BOMB;
      ROOMS.get(sok.room).bombs.set(x*100 + y, sok.color);

      ROOMS.get(sok.room)[sok.color].bombs --;

      const bombLength = ROOMS.get(sok.room)[sok.color].bombLength;
      const roomStatus = sok.getRoomStatus();

      const id1 = setTimeout(() => {
         if (sok.getRoomStatus() !== roomStatus)
            return;
         if (sok.map[y][x] === BLOCK.BOMB)
            explodeBomb(x, y, bombLength, 0, io, ROOMS, sok);
      }, BOMB_TIMES[ROOMS.get(sok.room)[sok.color].bombTimeIndex]);

      sok.intervalIDS.add(id1);
   };


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
      sok.setSpeedIndex(sok.getSpeedIndex() + 1);
   }

   function collectPowerupShield() {
      sok.setShield1();
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
            sok.placeBomb();
            const id = setTimeout(() => {
               if (ROOMS.get(sok.room)?.[sok.color]?.selected)
                  ROOMS.get(sok.room)[sok.color].sick --;
            }, ILLNESS_TIME);
            sok.intervalIDS.add(id);

            break;
      }
   }


   sok.collectPowerup = (x, y) => {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(sok.map[y][x]))
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
               sok.setSpeedIndex(0);
               plr.bombs = 1;
               plr.bombTimeIndex = 0;
               plr.bombLength = 2;
               // plr.kickBombs = 0;  // need event in order to transmit to the player
               sok.setShield0();
               io.to(sok.room).emit('playsound', 'bonusLost');
               break;
            case 10: // BonusALL
               sok.setSpeedIndex(2);
               plr.bombs = 4;
               plr.bombTimeIndex = 3;
               plr.bombLength = 16;
               // plr.kickBombs = true;
               sok.setShield1();
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

   sok.on('coords', (coords) => {
      coords_event(coords, io, ROOMS, sok);
   });

   sok.on('disconnect', () => {
      disconnect_event(io, ROOMS, sok);
   });
});