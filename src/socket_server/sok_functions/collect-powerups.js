'use strict';

const CONST = require('../consts');

module.exports = (io, sok) => {
   function collectPowerupBombplus() {
      if (sok.bombs < 4)
         sok.bombs ++
   }

   function collectPowerupBomblength() {
      sok.bombLength += 2
   }

   function collectPowerupSpeed() {
      const currentIndex = sok.getSpeedIndex(io, sok);
      sok.setSpeedIndex(currentIndex + 1, io, sok);
   }

   function collectPowerupShield() {
      sok.setShieldTrue(io, sok);
   }

   function collectPowerupKickbombs() { // Work In Progress
      
   }

   function collectPowerupBombtime() {
      if (sok.bombTimeIndex < CONST.BOMB_TIMES.length - 1) {
         sok.bombTimeIndex ++;
      }
   }

   function collectPowerupSwitchplayer() {
      const otherPlayers = [];
      ['white', 'black', 'orange', 'green'].forEach(otherColor => {
         if (sok.room[otherColor] && !sok.room[otherColor].dead && otherColor !== sok.color)
            otherPlayers.push(otherColor);
      });

      if (otherPlayers.length === 0)
         return;
      
      const randIdx = Math.floor(Math.random() * otherPlayers.length);
      const randColor = otherPlayers[randIdx];

      let coordsMe = sok.coords;
      let coordsYo = sok.room[randColor].coords;
      [coordsMe.x, coordsYo.x] = [coordsYo.x, coordsMe.x];
      [coordsMe.y, coordsYo.y] = [coordsYo.y, coordsMe.y];
      sok.emit('coords', sok.color, coordsMe, CONST.ANIMATION.IDLE);
      sok.room[randColor].emit('coords', randColor, coordsYo, CONST.ANIMATION.IDLE);
   }

   function collectPowerupSick() {
      const rand = Math.floor(Math.random() * 2);
      if (rand === 0) {
         sok.emit('switchKeys');
      } else {
         sok.setSickTrue(io, sok);
      }
   }


   sok.collectPowerup = (x, y) => {
      if ( !(0 <= x && x < CONST.BLOCKS_HORIZONTALLY && 0 <= y && y < CONST.BLOCKS_VERTICALLY) )
         return;
      
      if (!(5 <= sok.room.map[y][x] && sok.room.map[y][x] <= 13)) // 69
         return;

      if (sok.room.map[y][x] === CONST.BLOCK.POWER_BOMBPLUS) {
         collectPowerupBombplus();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_BOMBLENGTH) {
         collectPowerupBomblength();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_SPEED) {
         collectPowerupSpeed();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_SHIELD) {
         collectPowerupShield();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_KICKBOMBS) {
         collectPowerupKickbombs();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_BOMBTIME) {
         collectPowerupBombtime();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_SWITCHPLAYER) {
         collectPowerupSwitchplayer();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_SICK) {
         collectPowerupSick();
      }
      else if (sok.room.map[y][x] === CONST.BLOCK.POWER_BONUS) {
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
               sok.setSpeedIndex(0, io, sok);
               sok.bombs = 1;
               sok.bombTimeIndex = 0;
               sok.bombLength = 2;
               // sok.kickBombs = 0;
               sok.setShieldFalse(io, sok);
               io.to(sok.roomname).emit('playsound', 'bonusLost');
               break;
            case 10: // BonusALL
               sok.setSpeedIndex(2, io, sok);
               sok.bombs = 4;
               sok.bombTimeIndex = 3;
               sok.bombLength = 16;
               // sok.kickBombs = true;
               sok.setShieldTrue(io, sok);
               io.to(sok.roomname).emit('playsound', 'bonusAll');
               break;
         }
      }
   
      io.to(sok.roomname).emit('mapUpdates', [{x, y, block: CONST.BLOCK.NO}]);
      sok.room.map[y][x] = CONST.BLOCK.NO;
   }
};