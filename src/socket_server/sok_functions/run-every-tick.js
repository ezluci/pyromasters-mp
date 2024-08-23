'use strict';

const CONST = require('../consts');

module.exports = (io, sok) => {
   
   sok.runEveryTick = () => {
      
      // send coordinates to everyone
      const coords = [];
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!sok.room[color]) {
            coords.push([CONST.INEXISTENT_POS.x, CONST.INEXISTENT_POS.y, CONST.ANIMATION.IDLE]);
         } else {
            coords.push([sok.room[color].coords.x, sok.room[color].coords.y, sok.room[color].animState]);
         }
      });
      io.to(sok.roomname).emit('C', coords);
      
      // check deaths
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!sok.room[color] || sok.room[color].dead)
            return;
         
         if (sok.room[color].isDying()) {
            io.to(sok.roomname).emit('death', color);

            sok.room[color].dead = true;
            sok.room[color].coords = { ...CONST.INEXISTENT_POS };
         }
      });
      
      // check players who are sick
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (sok.room[color]?.sick) {
            sok.placeBomb();
         }
      });
      
      // collect powerups
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!sok.room[color] || sok.room[color].dead) {
            return;
         }
         sok.room[color].collectPowerup(Math.floor(sok.room[color].coords.x / CONST.BLOCK_SIZE), Math.floor(sok.room[color].coords.y / CONST.BLOCK_SIZE));
         sok.room[color].collectPowerup(Math.ceil(sok.room[color].coords.x / CONST.BLOCK_SIZE), Math.ceil(sok.room[color].coords.y / CONST.BLOCK_SIZE));
      });
      
      // update bombs' positions
      sok.room.bombs.forEach((bomb, bombId) => {
         if (bomb.xvel || bomb.yvel) {
            const oldCoords = {x: bomb.x, y: bomb.y};
            bomb.x += bomb.xvel * CONST.KICK_BOMB_SPEED;
            bomb.y += bomb.yvel * CONST.KICK_BOMB_SPEED;
            const newCoords = {x: bomb.x, y: bomb.y};
            
            let checkBlock = null;
            if (bomb.xvel) {
               checkBlock = {};
               checkBlock.y = oldCoords.y;
               if (bomb.xvel === 1) {
                  checkBlock.x = Math.floor(oldCoords.x) + 1;
               } else if (bomb.xvel === -1) {
                  checkBlock.x = Math.floor(oldCoords.x);
                  if (oldCoords.x === Math.floor(oldCoords.x)) {
                     checkBlock.x --;
                  }
               }
            } else if (bomb.yvel) {
               checkBlock = {};
               checkBlock.x = oldCoords.x;
               if (bomb.yvel === 1) {
                  checkBlock.y = Math.floor(oldCoords.y) + 1;
               } else if (bomb.yvel === -1) {
                  checkBlock.y = Math.floor(oldCoords.y);
                  if (oldCoords.y === Math.floor(oldCoords.y)) {
                     checkBlock.y --;
                  }
               }
            }
            
            if (checkBlock) {
               const otherBombId = sok.getBombIdByCoords(checkBlock.x, checkBlock.y)
               if (!(0 <= checkBlock.x && checkBlock.x < CONST.BLOCKS_HORIZONTALLY) ||
                     !(0 <= checkBlock.y && checkBlock.y < CONST.BLOCKS_VERTICALLY) ||
                     sok.room.map[checkBlock.y][checkBlock.x] === CONST.BLOCK.PERMANENT ||
                     sok.room.map[checkBlock.y][checkBlock.x] === CONST.BLOCK.NORMAL ||
                     otherBombId && otherBombId !== bombId) {
                  newCoords.x = Math.round(oldCoords.x);
                  newCoords.y = Math.round(oldCoords.y);
                  bomb.xvel = bomb.yvel = 0;
               }
            }
            
            bomb.x = newCoords.x;
            bomb.y = newCoords.y;
            io.to(sok.roomname).emit('updateBomb', oldCoords.x, oldCoords.y, newCoords.x, newCoords.y);
         }
      });
      
      // prepare endscreen
      if (!sok.room.endscreen_tickId && sok.countNotDead() <= 1 && sok.countNotDead() !== sok.room.selectedPlayersInitial) {
         sok.room.endscreen_tickId = sok.room.ticks.addFunc(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT / sok.room.ticks.MSPT);
      }
   };
}