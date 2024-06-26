'use strict';

const CONST = require('../consts')();

function destroyRoom(io, ROOMS, sok) {
   if (! sok.room) {
      return;
   }
   
   io.to(sok.roomname).emit('chat', sok.username, 'Owner left. Room deleted.');
   
   sok.room.players.forEach(player => {
      player.sok.disconnect();
   });
   sok.room.intervalIDS.forEach((id) => {
      clearInterval(id);
   });
   sok.room.intervalIDS.clear();
   ROOMS.delete(sok.roomname);
}

module.exports.destroyRoom = destroyRoom;