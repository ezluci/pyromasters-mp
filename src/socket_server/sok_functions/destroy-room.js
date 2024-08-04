'use strict';

const CONST = require('../consts');

module.exports = (io, ROOMS, sok) => {
   sok.destroyRoom = () => {
      if (! sok.room) {
         return;
      }
      
      io.to(sok.roomname).emit('chat', sok.username, 'Owner left. Room deleted.');
      
      sok.room.players.forEach(player => {
         player.disconnect();
      });
      sok.room.intervalIDS.forEach((id) => {
         clearInterval(id);
      });
      sok.room.intervalIDS.clear();
      ROOMS.delete(sok.roomname);
   }
}