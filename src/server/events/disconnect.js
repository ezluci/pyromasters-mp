const CONST = require('../consts')()

const destroyRoom = require('../functions/destroyRoom').destroyRoom;

function disconnect(io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   console.log(`disconnected: ${sok.id}, {username: ${sok.username}, room: ${sok.room}, isOwner: ${sok.isOwner}}`);

   sok.to(sok.room).emit('player-', sok.username);
   ROOMS.get(sok.room).players.delete(sok.username);

   if (!ROOMS.get(sok.room) || sok.isOwner) { // room empty or isOwner
      destroyRoom(io, ROOMS, sok);
      sok.disconnect();
      return;
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