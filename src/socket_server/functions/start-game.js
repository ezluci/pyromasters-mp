'use strict';

const CONST = require('../consts')();

const { explodeBomb } = require('./bombs');


function startGame(io, sok) {
   if (! sok.room) {
      return;
   }

   sok.room.intervalIDS.forEach(id => { clearInterval(id) });
   sok.room.intervalIDS.clear();
   sok.room.intervalIDS.add(sok.room.ticks.intervalId);

   sok.setRoomStatus(CONST.ROOM_STATUS.RUNNING);
   sok.room.ticks.startTickLoop();

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

   // generate map
   for (let y = 0; y < CONST.BLOCKS_VERTICALLY; ++y) {
      for (let x = 0; x < CONST.BLOCKS_HORIZONTALLY; ++x) {
         if (y % 2 == 1 && x % 2 == 1) {
            sok.room.map[y][x] = CONST.BLOCK.PERMANENT;
         } else {
            let canDraw = true;
            [
               [0, 0], [0, 1], [1, 0],
               [0, CONST.BLOCKS_HORIZONTALLY-2], [0, CONST.BLOCKS_HORIZONTALLY-1], [1, CONST.BLOCKS_HORIZONTALLY-1],
               [CONST.BLOCKS_VERTICALLY-2, 0], [CONST.BLOCKS_VERTICALLY-1, 0], [CONST.BLOCKS_VERTICALLY-1, 1],
               [CONST.BLOCKS_VERTICALLY-2, CONST.BLOCKS_HORIZONTALLY-1], [CONST.BLOCKS_VERTICALLY-1, CONST.BLOCKS_HORIZONTALLY-1], [CONST.BLOCKS_VERTICALLY-1, CONST.BLOCKS_HORIZONTALLY-2]
            ].forEach(coordBlocked => {
               if (y == coordBlocked[0] && x == coordBlocked[1])
                  canDraw = false;
            })

            if (!canDraw)
               sok.room.map[y][x] = CONST.BLOCK.NO;
            else
               sok.room.map[y][x] = (Math.random() >= .2 ? CONST.BLOCK.NORMAL : CONST.BLOCK.NO);
         }
      }
   }

   io.to(sok.roomname).emit('map', sok.room.map);
}

module.exports.startGame = startGame;