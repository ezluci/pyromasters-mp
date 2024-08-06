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

      filled[yg][xg] = true;
      sok.room.map[yg][xg] = CONST.BLOCK.PERMANENT;

      io.to(sok.roomname).emit('mapUpdates', [{x: xg, y: yg, block: CONST.BLOCK.PERMANENT}]);
      io.to(sok.roomname).emit('playsound', 'walldrop');

      // check if anyone dies to this new block
      ['white', 'black', 'orange', 'green'].forEach((color) => {
         if (sok.room[color] && !sok.room[color].dead && !sok.room[color].shield && sok.onDeadlyBlockCheck(color)) {
            io.to(sok.roomname).emit('death', color);
            sok.room[color].dead = true;
            sok.room[color].coords = { ...CONST.INEXISTENT_POS };

            if (sok.countNotDead() <= 1) {
               sok.room.ticks.addFunc(sok.showEndScreen, sok.room.ticks.TPS * CONST.END_SCREEN_TIMEOUT / 1000);
            }
         }
      });

      // check if any bomb explodes in this new block
      /*if (sok.room.bombs.get(yg*100 + xg)) { // this needs to go away asap
         sok.explodeBomb(xg, yg, sok.bombLength, false, io, sok); // bug!
         const xsg = xg, ysg = yg;
         const id = setTimeout(() => {
            sok.room.map[ysg][xsg] = CONST.BLOCK.PERMANENT;
            io.to(sok.roomname).emit('mapUpdates', [{x: xsg, y: ysg, block: CONST.BLOCK.PERMANENT}]);
         }, CONST.FIRE_TIME);
         sok.room.intervalIDS.add(id);
      }*/

      [xg, yg] = [xn, yn];
   }
}