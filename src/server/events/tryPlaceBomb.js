'use strict';

const CONST = require('../consts')()

const { placeBomb, explodeBomb } = require('../functions/bombs');




function tryPlaceBomb(io, ROOMS, sok) {
   if (ROOMS.get(sok.room)[sok.color].sick)
      return; // the 'coords' event + collectPowerupIllness()  will do the job here
   placeBomb(io, ROOMS, sok);
}

module.exports.tryPlaceBomb = tryPlaceBomb;