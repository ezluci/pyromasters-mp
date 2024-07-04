'use strict';

const CONST = require('../consts')()

const placeBomb = require('../functions/bombs').placeBomb;

function coords(coords, animState, io, sok) {
   if (!sok.detailsOkCheck())
      return;

   if (sok.color === 'spectator')
      return sok.emit('error', 'coords: You are a spectator.');
   if (sok.dead)
      return sok.emit('error', 'coords: Player is \'dead\'');
   if (['idle', 'front', 'back', 'left', 'right'].findIndex(anim => anim == animState) == -1)
      return sok.emit('error', 'coords: Invalid animation state.');
   if (isNaN(coords?.x) || isNaN(coords?.y)) {
      return sok.emit('error', 'coords: invalid coords');
   }

   // check if player dies to bombfire
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING && !sok.shield && sok.onDeadlyBlockCheck(sok.color)) {
      io.to(sok.roomname).emit('death', sok.color);
      sok.dead = true;
      sok.coords = { ...CONST.INEXISTENT_POS };

      if (sok.countNotDead() <= 1) {
         sok.room.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
      }

      return;
   }

   coords.x = Math.floor(coords.x);
   coords.y = Math.floor(coords.y);
   sok.coords = coords;
   sok.animState = (animState === 'idle' ? 0 : animState === 'front' ? 1 : animState === 'back' ? 2 : animState === 'left' ? 3 : animState === 'right' ? 4 : -1);

   // check if player collected some powerup
   sok.collectPowerup(Math.floor(sok.coords.x / CONST.BLOCK_SIZE), Math.floor(sok.coords.y / CONST.BLOCK_SIZE));
   sok.collectPowerup(Math.ceil(sok.coords.x / CONST.BLOCK_SIZE), Math.ceil(sok.coords.y / CONST.BLOCK_SIZE));

   // check if player is sick
   if (sok.sick)
      placeBomb(io, sok);
}

module.exports.coords = coords;