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
      
      // prepare endscreen
      if (!sok.room.endscreen_tickId && sok.countNotDead() <= 1 && sok.countNotDead() !== sok.room.selectedPlayersInitial) {
         sok.room.endscreen_tickId = sok.room.ticks.addFunc(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT / sok.room.ticks.MSPT);
      }
   };
}