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
         const winner = sok.room[winnerColor];
         winner.wins ++;
      }

      const ranking = [];
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (sok.room[color]) {
            ranking.push({ username: sok.room[color].username, wins: sok.room[color].wins, kills: sok.room[color].kills });
         }
      });

      io.to(sok.roomname).emit('endscreen', winnerColor, ranking);
      sok.setRoomStatus(CONST.ROOM_STATUS.WAITING);
      sok.setMapName(null);
   }
};