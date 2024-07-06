'use strict';

const CONST = require('../consts')();

module.exports = (io, sok) => {
   sok.showEndScreen = () => {
      if (!sok.room)
         return;
      
      sok.room.ticks.endTickLoop();
      
      const notDead = [];
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (sok.room[color] && !sok.room[color].dead)
            notDead.push(color);
      });

      if (notDead.length >= 2)
         return;

      const winnerColor = notDead[0];
      if (winnerColor) {
         const winnerName = sok.room[winnerColor].username;
         if (!sok.room.ranking[winnerName])
            sok.room.ranking[winnerName] = 0;
         sok.room.ranking[winnerName] ++;
      }

      io.to(sok.roomname).emit('endscreen', winnerColor, sok.room.ranking);
      sok.setRoomStatus(CONST.ROOM_STATUS.ENDED);
   }
};