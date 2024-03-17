'use strict';

const CONST = require('../consts')();

function destroyRoom(io, ROOMS, sok) {
   if (! ROOMS.get(sok.room)) {
      return;
   }
   
   io.to(sok.room).emit('chat', sok.username, 'Owner left. Room deleted.');

   ROOMS.get(sok.room).intervalIDS.forEach((id) => {
      clearInterval(id);
   });
   ROOMS.get(sok.room).intervalIDS.clear();
   ROOMS.delete(sok.room);
}

module.exports.destroyRoom = destroyRoom;