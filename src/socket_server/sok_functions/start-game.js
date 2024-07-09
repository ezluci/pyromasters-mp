'use strict';

const CONST = require('../consts')();

module.exports = (io, sok) =>  {

   sok.startGame = () => {
      if (! sok.room) {
         return;
      }


      sok.setRoomStatus(CONST.ROOM_STATUS.RUNNING);

      sok.room.gameTime = 120 - 1; // 2 minutes
      sok.emit('gameTime', sok.room.gameTime);

      // gameTime handling
      let xg = 0, yg = 0, xdir = 1, ydir = 0;
      const filled = [];
      for (let i = 0; i < CONST.BLOCKS_VERTICALLY; ++i) {
         filled[i] = [];
         for (let j = 0; j < CONST.BLOCKS_HORIZONTALLY; ++j)
            filled[i][j] = false;
      }


      let endgame_blocks = 0;

      let gameTime_intervalId = setInterval(() => {
         if (! sok.room)
            return;
         
         sok.room.gameTime --;
         io.to(sok.roomname).emit('gameTime', sok.room.gameTime);
         
         if (sok.room.gameTime === 0) { // start placing endgame blocks
            clearInterval(gameTime_intervalId);
            let gameTime_intervalId2 = setInterval(() => {
               if (! sok.room)
                  return;
         
               if (++endgame_blocks == CONST.BLOCKS_HORIZONTALLY * CONST.BLOCKS_VERTICALLY) {
                  clearInterval(gameTime_intervalId2);
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
                        sok.room.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
                     }
                  }
               });

               // check if any bomb explodes in this new block
               if (sok.room.bombs.get(yg*100 + xg)) {
                  explodeBomb(xg, yg, sok.bombLength, false, io, sok); // bug!
                  const xsg = xg, ysg = yg;
                  const id = setTimeout(() => {
                     sok.room.map[ysg][xsg] = CONST.BLOCK.PERMANENT;
                     io.to(sok.roomname).emit('mapUpdates', [{x: xsg, y: ysg, block: CONST.BLOCK.PERMANENT}]);
                  }, CONST.FIRE_TIME);
                  sok.room.intervalIDS.add(id);
               }
               

               [xg, yg] = [xn, yn];
            }, 840); // 21/25 frames

            sok.room.intervalIDS.add(gameTime_intervalId2);
         }
         
      }, 1000);

      sok.room.intervalIDS.add(gameTime_intervalId);
   }
}