'use strict';

const CONST = require('../consts');

function isPowerup(blockCode) {
   return (5 <= blockCode && blockCode <= 13);
}

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
            sok.room[color].placeBomb();
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
               oldCoords.y = Math.round(oldCoords.y);
               newCoords.y = Math.round(newCoords.y);
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
               oldCoords.x = Math.round(oldCoords.x);
               newCoords.x = Math.round(newCoords.x);
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
            
            // checking if the bomb can continue walking
            let canGo = true;
            if (0 <= checkBlock.x && checkBlock.x < CONST.BLOCKS_HORIZONTALLY && 0 <= checkBlock.y && checkBlock.y < CONST.BLOCKS_VERTICALLY) {
               if (sok.room.map[checkBlock.y][checkBlock.x] === CONST.BLOCK.PERMANENT ||
                     sok.room.map[checkBlock.y][checkBlock.x] === CONST.BLOCK.NORMAL) {
                  canGo = false;
               }
               
               const otherBombId = sok.getBombIdByCoords(checkBlock.x, checkBlock.y);
               if (otherBombId && otherBombId !== bombId) {
                  canGo = false;
               }
               
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (!sok.room[color] || sok.room[color].dead) {
                     return;
                  }
                  
                  if (sok.room[color].coords.x / CONST.BLOCK_SIZE === checkBlock.x) {
                     if (Math.abs(sok.room[color].coords.y / CONST.BLOCK_SIZE - checkBlock.y) < 1) {
                        canGo = false;
                     }
                  } else if (sok.room[color].coords.y / CONST.BLOCK_SIZE === checkBlock.y) {
                     if (Math.abs(sok.room[color].coords.x / CONST.BLOCK_SIZE - checkBlock.x) < 1) {
                        canGo = false;
                     }
                  }
               });
            } else {
               canGo = false;
            }
            
            
            if (!canGo) {
               newCoords.x = Math.round(oldCoords.x);
               newCoords.y = Math.round(oldCoords.y);
               bomb.xvel = bomb.yvel = 0;
            } else {
               // does it destroy any powerup?
               if (isPowerup(sok.room.map[checkBlock.y][checkBlock.x])) {
                  sok.room.map[checkBlock.y][checkBlock.x] = CONST.BLOCK.NO;
                  io.to(sok.roomname).emit('mapUpdates', [{ x: checkBlock.x, y: checkBlock.y, block: CONST.BLOCK.NO }]);
               }
               
               // explode if it walks in bombfire
               let exploded = false;
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (sok.room.bombfires.has(Math.round(newCoords.x), Math.round(newCoords.y), sok.room[color])) {
                     sok.explodeBomb(bombId, false);
                     exploded = true;
                  }
               });
               if (exploded) {
                  return; // not a bomb anymore
               }
            }
            
            bomb.x = newCoords.x;
            bomb.y = newCoords.y;
            io.to(sok.roomname).emit('updateBomb', bombId, newCoords.x, newCoords.y);
         }
      });
      
      // prepare endscreen
      if (!sok.room.endscreen_tickId && sok.countNotDead() <= 1 && sok.countNotDead() !== sok.room.selectedPlayersInitial) {
         sok.room.endscreen_tickId = sok.room.ticks.addFunc(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT / sok.room.ticks.MSPT);
      }
   };
}