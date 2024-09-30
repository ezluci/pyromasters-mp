'use strict';

const CONST = require('../consts');

module.exports = (io, sok) => {
   
   sok.placeEndgameBlock = () => {
      if (sok.room.endscreen_tickId) { // the game is finished
         return;
      }

      if (sok.room.endgameBlocks === null) {
         let xg = 0, yg = 0, xdir = 1, ydir = 0, filled = [];
         for (let i = 0; i < CONST.BLOCKS_VERTICALLY; ++i) {
            filled[i] = [];
            for (let j = 0; j < CONST.BLOCKS_HORIZONTALLY; ++j)
               filled[i][j] = false;
         }
         sok.room.endgameBlocks = 0;
         sok.room.endgameInfo = {xg, yg, xdir, ydir, filled};
      }

      const info = sok.room.endgameInfo;

      if (sok.room.endgameBlocks + 1 === CONST.BLOCKS_HORIZONTALLY * CONST.BLOCKS_VERTICALLY) {
         console.error('can\'t place endgame block');
         return;
      }

      let xn = info.xg + info.xdir;
      let yn = info.yg + info.ydir;

      if ( !(0 <= xn && xn < CONST.BLOCKS_HORIZONTALLY && 0 <= yn && yn < CONST.BLOCKS_VERTICALLY && !info.filled[yn][xn]) ) {
         [info.xdir, info.ydir] = [info.ydir, info.xdir];
         if (info.xdir)
            info.xdir *= -1;
         
         xn = info.xg + info.xdir;
         yn = info.yg + info.ydir;
      }
      
      const bombId = sok.getBombIdByCoords(info.xg, info.yg);
      if (bombId) {
         sok.explodeBomb(bombId, false);
      }

      info.filled[info.yg][info.xg] = true;
      sok.room.map[info.yg][info.xg] = CONST.BLOCK.PERMANENT;

      io.to(sok.roomname).emit('mapUpdates', [{x: info.xg, y: info.yg, block: CONST.BLOCK.PERMANENT}]);
      io.to(sok.roomname).emit('playsound', 'walldrop');

      [info.xg, info.yg] = [xn, yn];
   }
}