'use strict';

module.exports = (io, sok) => {
   sok.countNotDead = () => {
      let cnt = 0;
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (sok.room[color] && !sok.room[color].dead)
            cnt++;
      });
      return cnt;
   }
};