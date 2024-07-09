'use strict';

const CONST = require('../consts')()

function disconnect(io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   console.log(`disconnected: ${sok.id}, {username: ${sok.username}, room: ${sok.roomname}, isOwner: ${sok.isOwner}}`);

   sok.to(sok.roomname).emit('player-', sok.username);
   sok.room.players.delete(sok.username);

   if (!sok.room || sok.isOwner) { // room empty or isOwner
      sok.destroyRoom();
   } else {
      if (sok.color !== 'spectator') {
         if (sok.getRoomStatus() !== CONST.ROOM_STATUS.WAITING && sok.getRoomStatus() !== CONST.ROOM_STATUS.STARTING) {
            io.to(sok.roomname).emit('coords', sok.color, CONST.INEXISTENT_POS);
            sok.room[sok.color] = null;
            if (sok.countNotDead() <= 1)
               sok.room.ticks.addFunc(sok.showEndScreen, sok.room.ticks.TPS * CONST.END_SCREEN_TIMEOUT / 1000);
         } else {
            io.to(sok.roomname).emit('coords', sok.color, CONST.DEFAULT_POS[sok.color]);
            sok.room[sok.color] = null;
            if (sok.countNotDead() <= 1)
               sok.room.ticks.addFunc(sok.showEndScreen, sok.room.ticks.TPS * CONST.END_SCREEN_TIMEOUT / 1000);
         }
      }
   }
}

module.exports.disconnect = disconnect;