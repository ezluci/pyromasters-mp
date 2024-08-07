'use strict';

const CONST = require('../consts');

module.exports = (io, sok) => {
   sok.showEndScreen = () => {
      if (sok.countNotDead() >= 2) {
         return console.error('showEndScreen ignored');
      }
      
      sok.room.ticks.endTickLoop();
      
      let winnerColor = null;
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (sok.room[color] && !sok.room[color].dead)
            winnerColor = color;
      });

      if (winnerColor) {
         const winnerName = sok.room[winnerColor].username;
         if (!sok.room.ranking[winnerName])
            sok.room.ranking[winnerName] = 0;
         sok.room.ranking[winnerName] ++;
      }

      io.to(sok.roomname).emit('endscreen', winnerColor, sok.room.ranking);
      sok.setRoomStatus(CONST.ROOM_STATUS.ENDED);
      sok.setMapName(null);
   }
};