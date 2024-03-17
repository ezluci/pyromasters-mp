'use strict';

const CONST = require('../consts')()

const placeBomb = require('../functions/bombs').placeBomb;

function coords(coords, io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;

   if (sok.color === 'spectator')
      return sok.emit('error', 'coords: You are a spectator.');
   if (ROOMS.get(sok.room)[sok.color].dead)
      return sok.emit('error', 'coords: Player is \'dead\'');

   // check if player dies to bombfire
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING && !sok.shield && sok.onDeadlyBlockCheck(sok.color)) {
      io.to(sok.room).emit('death', sok.color);
      ROOMS.get(sok.room)[sok.color].dead = true;
      ROOMS.get(sok.room)[sok.color].coords = Object.assign(CONST.INEXISTENT_POS);

      if (sok.countNotDead() <= 1) {
         ROOMS.get(sok.room).intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
      }

      return;
   }

   sok.to(sok.room).emit('coords', sok.color, coords);
   ROOMS.get(sok.room)[sok.color].coords = coords;

   // check if player collected some powerup
   const x = ROOMS.get(sok.room)[sok.color].coords.x;
   const y = ROOMS.get(sok.room)[sok.color].coords.y;
   sok.collectPowerup(Math.floor(x / CONST.BLOCK_SIZE), Math.floor(y / CONST.BLOCK_SIZE));
   sok.collectPowerup(Math.ceil(x / CONST.BLOCK_SIZE), Math.ceil(y / CONST.BLOCK_SIZE));

   // check if player is sick
   if (ROOMS.get(sok.room)[sok.color].sick)
      placeBomb(io, ROOMS, sok);
}

module.exports.coords = coords;