'use strict';

const CONST = require('../consts')

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

   coords.x = Math.floor(coords.x);
   coords.y = Math.floor(coords.y);
   sok.coords = coords;
   sok.animState = (animState === 'idle' ? 0 : animState === 'front' ? 1 : animState === 'back' ? 2 : animState === 'left' ? 3 : animState === 'right' ? 4 : -1);
}

module.exports.coords = coords;