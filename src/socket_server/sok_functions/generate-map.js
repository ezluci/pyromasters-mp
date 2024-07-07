'use strict';

const CONST = require('../consts')();

module.exports = (io, sok) => {
   // this function needs to know the map name
   sok.generateMap = () => {
      const map = [];

      for (let y = 0; y < CONST.BLOCKS_VERTICALLY; ++y) {
         map[y] = [];
         for (let x = 0; x < CONST.BLOCKS_HORIZONTALLY; ++x) {
            if (y % 2 == 1 && x % 2 == 1) {
               map[y][x] = CONST.BLOCK.PERMANENT;
            } else {

               let canDraw = true;
               const blockedCoords = [
                  [0, 0], [0, 1], [1, 0],
                  [0, CONST.BLOCKS_HORIZONTALLY-2], [0, CONST.BLOCKS_HORIZONTALLY-1], [1, CONST.BLOCKS_HORIZONTALLY-1],
                  [CONST.BLOCKS_VERTICALLY-2, 0], [CONST.BLOCKS_VERTICALLY-1, 0], [CONST.BLOCKS_VERTICALLY-1, 1],
                  [CONST.BLOCKS_VERTICALLY-2, CONST.BLOCKS_HORIZONTALLY-1], [CONST.BLOCKS_VERTICALLY-1, CONST.BLOCKS_HORIZONTALLY-1], [CONST.BLOCKS_VERTICALLY-1, CONST.BLOCKS_HORIZONTALLY-2]
               ];
               
               blockedCoords.forEach(blockedCoord => {
                  if (y == blockedCoord[0] && x == blockedCoord[1])
                     canDraw = false;
               });

               if (sok.getMapName() === 'fourway') {
                  CONST.MAP_FOURWAY_PORTAL_POSITIONS.forEach(({x: xx, y: yy}) => {
                     if (xx === x && yy === y) {
                        canDraw = false;
                     }
                  });
               }

               if (!canDraw)
                  map[y][x] = CONST.BLOCK.NO;
               else
                  map[y][x] = (Math.random() >= .2 ? CONST.BLOCK.NORMAL : CONST.BLOCK.NO);
            }
         }
      }

      return map;
   }
}