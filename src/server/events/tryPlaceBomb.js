const CONST = require('../consts')()

function tryPlaceBomb(io, ROOMS, sok) {
   if (ROOMS.get(sok.room)[sok.color].sick)
      return; // the 'coords' event will do the job here
   sok.placeBomb();
}

module.exports.tryPlaceBomb = tryPlaceBomb;