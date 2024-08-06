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
      
      // kill people who are in fire
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!sok.room[color] || sok.room[color].dead)
            return;
         
         if (!sok.room[color].getShield() && sok.room[color].onDeadlyBlockCheck(color)) {
            io.to(sok.roomname).emit('death', color);

            sok.room[color].dead = true;
            sok.room[color].coords = { ...CONST.INEXISTENT_POS };

            if (sok.countNotDead() <= 1)
               sok.room.ticks.addFunc(sok.showEndScreen, sok.room.ticks.TPS * CONST.END_SCREEN_TIMEOUT / 1000);
         }
      });
   };
}