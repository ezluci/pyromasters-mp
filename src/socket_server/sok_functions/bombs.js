'use strict';

const CONST = require('../consts')();


module.exports = (io, sok) => {
   
   // this function doesn't check if there is a bomb at map[y][x].
   sok.explodeBomb = (x, y, bombLength, recursive) => {
      if (! sok.room)
         return;
      
      const roomStatus = sok.getRoomStatus();
      
      function breakLoop(blockCode) // a block before/on which the fire should stop.
         { return (blockCode === CONST.BLOCK.NORMAL || blockCode === CONST.BLOCK.PERMANENT || (5 <= blockCode && blockCode <= 13)); }
      
      let fires = [];

      fires.push({x, y, block: CONST.BLOCK.FIRE, oldBlock: sok.room.map[y][x]});
      sok.room.map[y][x] = CONST.BLOCK.NO;

      for (let yy = y-1; yy >= Math.max(0, y - bombLength); --yy) {
         if (sok.room.map[yy][x] === CONST.BLOCK.BOMB) {
            fires = fires.concat( sok.explodeBomb(x, yy, bombLength, 1) );
            break;
         }
         if (sok.room.map[yy][x] !== CONST.BLOCK.PERMANENT)
            fires.push({x: x, y: yy, block: CONST.BLOCK.FIRE, oldBlock: sok.room.map[yy][x]});
         if (breakLoop(sok.room.map[yy][x]))
            break;
      }

      for (let yy = y+1; yy <= Math.min(CONST.BLOCKS_VERTICALLY-1, y + bombLength); ++yy) {
         if (sok.room.map[yy][x] === CONST.BLOCK.BOMB) {
            fires = fires.concat( sok.explodeBomb(x, yy, bombLength, 1) );
            break;
         }
         if (sok.room.map[yy][x] !== CONST.BLOCK.PERMANENT)
            fires.push({x: x, y: yy, block: CONST.BLOCK.FIRE, oldBlock: sok.room.map[yy][x]});
         if (breakLoop(sok.room.map[yy][x]))
            break;
      }

      for (let xx = x-1; xx >= Math.max(0, x - bombLength); --xx) {
         if (sok.room.map[y][xx] === CONST.BLOCK.BOMB) {
            fires = fires.concat( sok.explodeBomb(xx, y, bombLength, 1) );
            break;
         }
         if (sok.room.map[y][xx] !== CONST.BLOCK.PERMANENT)
            fires.push({x: xx, y: y, block: CONST.BLOCK.FIRE, oldBlock: sok.room.map[y][xx]});
         if (breakLoop(sok.room.map[y][xx]))
            break;
      }

      for (let xx = x+1; xx <= Math.min(CONST.BLOCKS_HORIZONTALLY-1, x + bombLength); ++xx) {
         if (sok.room.map[y][xx] === CONST.BLOCK.BOMB) {
            fires = fires.concat( sok.explodeBomb(xx, y, bombLength, 1) );
            break;
         }
         if (sok.room.map[y][xx] !== CONST.BLOCK.PERMANENT)
            fires.push({x: xx, y: y, block: CONST.BLOCK.FIRE, oldBlock: sok.room.map[y][xx]});
         if (breakLoop(sok.room.map[y][xx]))
            break;
      }

      if (recursive)
         return fires;
      
      fires.forEach((fire) => {
         sok.room.map[fire.y][fire.x] = CONST.BLOCK.FIRE;
      });

      io.to(sok.roomname).emit('mapUpdates', fires);

      // kill people who are in fire
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!sok.room[color] || sok.room[color].dead)
            return;
         
         if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING && !sok.room[color].getShield() && sok.room[color].onDeadlyBlockCheck(color)) {
            io.to(sok.roomname).emit('death', color);

            sok.room[color].dead = true;
            sok.room[color].coords = { ...CONST.INEXISTENT_POS };

            if (sok.countNotDead() <= 1)
               sok.room.intervalIDS.add( setTimeout(sok.showEndScreen, CONST.END_SCREEN_TIMEOUT) );
         }
      });

      // removing fire
      const id2 = setTimeout(() => {
         if (!sok.room)
            return;
         
         if (sok.getRoomStatus() !== roomStatus)
            return;
         
         fires.forEach((fire) => {

            let newBlock = CONST.BLOCK.NO;

            if (fire.oldBlock === CONST.BLOCK.NORMAL)
            {
               const rand = Math.floor(Math.random() * 18);
               if (rand > 7) {
                  const rand = Math.floor(Math.random() * 14);
                  
                  if (rand === 0 || rand === 1 || rand === 2 || rand === 3)
                     newBlock = CONST.BLOCK.POWER_BOMBLENGTH;
                  else if (rand === 4)
                     newBlock = CONST.BLOCK.POWER_BOMBPLUS;
                  else if (rand === 5)
                     newBlock = CONST.BLOCK.POWER_BOMBTIME;
                  else if (rand === 6)
                     newBlock = CONST.BLOCK.POWER_KICKBOMBS;
                  else if (rand === 7 || rand === 8)
                     newBlock = CONST.BLOCK.POWER_SPEED;
                  else if (rand === 9)
                     newBlock = CONST.BLOCK.POWER_SHIELD;
                  else if (rand === 10)
                     newBlock = CONST.BLOCK.POWER_SWITCHPLAYER;
                  else if (rand === 11)
                     newBlock = CONST.BLOCK.POWER_SICK;
                  else if (rand === 12 || rand === 13)
                     newBlock = CONST.BLOCK.POWER_BONUS;
               }

               // collecting powerups
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (!sok.room[color] || sok.room[color].dead)
                     return;
                  
                  const x = sok.room[color].x;
                  const y = sok.room[color].y;
                  sok.collectPowerup(Math.floor(x / CONST.BLOCK_SIZE), Math.floor(y / CONST.BLOCK_SIZE));
                  sok.collectPowerup(Math.ceil(x / CONST.BLOCK_SIZE), Math.floor(y / CONST.BLOCK_SIZE));
               });
            }

            fire.block = newBlock;
            sok.room.map[fire.y][fire.x] = newBlock;

            if (fire.oldBlock === CONST.BLOCK.BOMB || fire.oldBlock === CONST.BLOCK.PERMANENT) {
               const x = fire.x;
               const y = fire.y;
               const color = sok.room.bombs.get(y*100 + x);

               if (!sok.room[color] || sok.room[color].dead)
                  return;

               if (sok.bombs < 4) {
                  sok.room[color].bombs ++;
               }

               sok.room.bombs.delete(y*100 + x);

               // check if player is sick
               if (sok.sick) {
                  sok.placeBomb();
               }
            }
         });

         io.to(sok.roomname).emit('mapUpdates', fires);

      }, CONST.FIRE_TIME);
      sok.room.intervalIDS.add(id2);
   }


   sok.placeBomb = () => {
      if (!sok.detailsOkCheck())
         return;
      
      if (sok.color === 'spectator')
         return sok.emit('error', 'tryPlaceBomb: You are a spectator.');
      if (sok.dead)
         return sok.emit('error', 'tryPlaceBomb: You are \'dead\'');
      
      const x = Math.round(sok.coords.x / CONST.BLOCK_SIZE);
      const y = Math.round(sok.coords.y / CONST.BLOCK_SIZE);
      
      if ( !(0 <= x && x <= CONST.BLOCKS_HORIZONTALLY && 0 <= y && y <= CONST.BLOCKS_VERTICALLY) )
         return sok.emit('error', 'tryPlaceBomb: x or y out of range.');
      
      if (sok.room.map[y][x] === CONST.BLOCK.FIRE || sok.room.map[y][x] === CONST.BLOCK.BOMB ||
            sok.room.map[y][x] === CONST.BLOCK.PERMANENT || sok.room.map[y][x] === CONST.BLOCK.NORMAL)
         return;
      
      if (sok.getMapName() === 'fourway') {
         if (CONST.MAP_FOURWAY_PORTAL_POSITIONS.filter(({x: xx, y: yy}) => (xx === x && yy === y)).length === 1) {
            return; // can't place bomb inside a portal
         }
      }
      
      if (sok.bombs === 0)
         return; // no bombs left
      
      // placing the bomb
      io.to(sok.roomname).emit('mapUpdates', [{x, y, block: CONST.BLOCK.BOMB, details: {sick: sok.sick}}]);
      sok.room.map[y][x] = CONST.BLOCK.BOMB;
      sok.room.bombs.set(y*100 + x, sok.color);

      sok.bombs --;

      const bombLength = sok.bombLength;
      const roomStatus = sok.getRoomStatus();

      const id1 = setTimeout(() => {
         if (sok.getRoomStatus() !== roomStatus)
            return;
         if (sok.room.map[y][x] === CONST.BLOCK.BOMB)
            sok.explodeBomb(x, y, bombLength, 0);
      }, CONST.BOMB_TIMES[sok.bombTimeIndex]);

      sok.room.intervalIDS.add(id1);
   }
}