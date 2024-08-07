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
      sok.room.ticks.endTickLoop();
      ROOMS.delete(sok.roomname);
   }
}