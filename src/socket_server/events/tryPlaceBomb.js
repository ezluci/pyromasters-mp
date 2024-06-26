'use strict';

const CONST = require('../consts')()

const { placeBomb, explodeBomb } = require('../functions/bombs');




function tryPlaceBomb(io, sok) {
   if (sok.room[sok.color].sick)
      return; // the 'coords' event + collectPowerupSick()  will do the job here
   placeBomb(io, sok);
}

module.exports.tryPlaceBomb = tryPlaceBomb;