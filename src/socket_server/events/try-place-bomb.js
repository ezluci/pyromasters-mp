'use strict';

const CONST = require('../consts')




function tryPlaceBomb(io, sok) {
   if (sok.sick)
      return; // the 'coords' event + collectPowerupSick()  will do the job here
   sok.placeBomb(io, sok);
}

module.exports.tryPlaceBomb = tryPlaceBomb;