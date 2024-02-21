'use strict';

const CONST = require('../consts')();

function destroyRoom(io, ROOMS, sok) {
   if (! ROOMS.get(sok.room)) {
      return;
   }
   
   io.to(sok.room).emit('chat', sok.username, 'Owner left. Room deleted.');

   ROOMS.delete(sok.room);
   sok.intervalIDS.forEach((id) => {
      clearInterval(id);
   });
   sok.intervalIDS.clear();
}

module.exports.destroyRoom = destroyRoom;