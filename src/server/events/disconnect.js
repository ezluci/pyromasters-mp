const CONST = require('../consts')()

function disconnect(io, ROOMS, sok) {
   if (!sok.username || !sok.room)
      return;
   
   console.log(`disconnected: ${sok.id}, {username: ${sok.username}, room: ${sok.room}, isOwner: ${sok.isOwner}}`);

   sok.to(sok.room).emit('player-', sok.username);
   ROOMS.get(sok.room).players.delete(sok.username);

   if (!io.sockets.adapter.rooms.get(sok.room)) { // room empty
      ROOMS.delete(sok.room);
      sok.intervalIDS.forEach((id) => {
         clearInterval(id);
      });
   } else {
      if (sok.color !== 'spectator') {
         if (sok.getRoomStatus() !== CONST.ROOM_STATUS.WAITING && sok.getRoomStatus() !== CONST.ROOM_STATUS.STARTING) {
            io.to(sok.room).emit('coords', sok.color, CONST.INEXISTENT_POS);
            ROOMS.get(sok.room)[sok.color].coords = Object.assign(CONST.INEXISTENT_POS);
            ROOMS.get(sok.room)[sok.color].selected = false;
            ROOMS.get(sok.room)[sok.color].dead = true;
            if (sok.countNotDead() <= 1)
               sok.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
         } else {
            io.to(sok.room).emit('coords', sok.color, CONST.DEFAULT_POS[sok.color]);
            ROOMS.get(sok.room)[sok.color].coords = Object.assign(CONST.DEFAULT_POS[sok.color]);
            ROOMS.get(sok.room)[sok.color].selected = false;
            ROOMS.get(sok.room)[sok.color].dead = true;
            if (sok.countNotDead() <= 1)
               sok.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
         }
      }
   }
}

module.exports.disconnect = disconnect;