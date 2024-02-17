const CONST = require('../consts')();

function startGame(io, ROOMS, sok) {
   if (! ROOMS.get(sok.room))
      return;

   sok.intervalIDS.forEach(id => { clearInterval(id) });
   sok.intervalIDS.clear();

   sok.setRoomStatus(CONST.ROOM_STATUS.RUNNING);
            
   ROOMS.get(sok.room).gameTime = 120 - 1;
   sok.emit('gameTime', ROOMS.get(sok.room).gameTime);

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
      if (! ROOMS.get(sok.room))
         return;
      
      ROOMS.get(sok.room).gameTime --;
      io.to(sok.room).emit('gameTime', ROOMS.get(sok.room).gameTime);
      
      if (ROOMS.get(sok.room).gameTime === 0) {
         clearInterval(gameTime_intervalId);
         let gameTime_intervalId2 = setInterval(() => {
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
            sok.map[yg][xg] = CONST.BLOCK.PERMANENT;

            io.to(sok.room).emit('mapUpdates', [{x: xg, y: yg, block: CONST.BLOCK.PERMANENT}]);
            io.to(sok.room).emit('playsound', 'walldrop');

            // check if anyone dies to this new block
            ['white', 'black', 'orange', 'green'].forEach((color) => {
               if (!ROOMS.get(sok.room)[color].dead && !ROOMS.get(sok.room)[color].shield && sok.onDeadlyBlockCheck(color)) {
                  io.to(sok.room).emit('death', color);
                  ROOMS.get(sok.room)[color].dead = true;
                  ROOMS.get(sok.room)[color].coords = Object.assign(CONST.INEXISTENT_POS);

                  if (sok.countNotDead() <= 1) {
                     sok.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
                  }
               }
            });
            

            [xg, yg] = [xn, yn];
         }, 840); // 21/25 frames

         sok.intervalIDS.add(gameTime_intervalId2);
      }
      
   }, 1000);

   sok.intervalIDS.add(gameTime_intervalId);

   // set stats for each player
   ['white', 'black', 'orange', 'green'].forEach(color => {
      if (ROOMS.get(sok.room)[color].selected === false) {
         ROOMS.get(sok.room)[color].coords = Object.assign(CONST.INEXISTENT_POS);
         ROOMS.get(sok.room)[color].dead = true;
      } else {
         ROOMS.get(sok.room)[color].coords = Object.assign(CONST.DEFAULT_POS[color]);
         ROOMS.get(sok.room)[color].dead = false;
         ROOMS.get(sok.room)[color].bombs = 1;
         ROOMS.get(sok.room)[color].bombTimeIndex = 0;
         ROOMS.get(sok.room)[color].bombLength = 2;
         sok.setSpeedIndex(0);
         ROOMS.get(sok.room)[color].sick = false;
         sok.setShield0();
         ROOMS.get(sok.room)[color].shieldTimeout = null;
      }
      io.to(sok.room).emit('coords', color, ROOMS.get(sok.room)[color].coords);
   })

   // generate map
   for (let y = 0; y < CONST.BLOCKS_VERTICALLY; ++y) {
      for (let x = 0; x < CONST.BLOCKS_HORIZONTALLY; ++x) {
         if (y % 2 == 1 && x % 2 == 1) {
            sok.map[y][x] = CONST.BLOCK.PERMANENT;
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
               sok.map[y][x] = CONST.BLOCK.NO;
            else
               sok.map[y][x] = (Math.random() < .7 ? CONST.BLOCK.NORMAL : CONST.BLOCK.NO); // need to check the original code here!!
         }
      }
   }

   io.to(sok.room).emit('map', sok.map);
}

module.exports.startGame = startGame;