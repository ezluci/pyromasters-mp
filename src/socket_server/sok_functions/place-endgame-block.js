'use strict';

const CONST = require('../consts');
const MultiMap = require('../multimap.js');

let xg, yg, xdir, ydir, filled;

module.exports = (io, sok) => {
   
   sok.placeEndgameBlock = () => {
      if (sok.room.endgameBlocks === null) {
         xg = 0;
         yg = 0;
         xdir = 1;
         ydir = 0;
         filled = [];
         for (let i = 0; i < CONST.BLOCKS_VERTICALLY; ++i) {
            filled[i] = [];
            for (let j = 0; j < CONST.BLOCKS_HORIZONTALLY; ++j)
               filled[i][j] = false;
         }
         sok.room.endgameBlocks = 0;
      }

      if (sok.room.endgameBlocks + 1 === CONST.BLOCKS_HORIZONTALLY * CONST.BLOCKS_VERTICALLY) {
         console.error('can\'t place endgame block');
         return;
      }

      let xn = xg + xdir;
      let yn = yg + ydir;

      if ( !(0 <= xn && xn < CONST.BLOCKS_HORIZONTALLY && 0 <= yn && yn < CONST.BLOCKS_VERTICALLY && !filled[yn][xn]) ) {
         [xdir, ydir] = [ydir, xdir];
         if (xdir)
            xdir *= -1;
         
         xn = xg + xdir;
         yn = yg + ydir;
      }
      
      const bombId = sok.getBombIdByCoords(xg, yg);
      if (bombId) {
         sok.explodeBomb(bombId, false);
      }

      filled[yg][xg] = true;
      sok.room.map[yg][xg] = CONST.BLOCK.PERMANENT;

      io.to(sok.roomname).emit('mapUpdates', [{x: xg, y: yg, block: CONST.BLOCK.PERMANENT}]);
      io.to(sok.roomname).emit('playsound', 'walldrop');

      [xg, yg] = [xn, yn];
   }
}