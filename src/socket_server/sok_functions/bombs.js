'use strict';

const CONST = require('../consts');
const MultiMap = require('../multimap.js');


module.exports = (io, sok) => {
   
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
      
      if (sok.room.bombfires.has(x, y, 'white') || sok.room.bombfires.has(x, y, 'black') ||
            sok.room.bombfires.has(x, y, 'orange') || sok.room.bombfires.has(x, y, 'green')) {
         return;
      }
      if (sok.room.bombs.has(x, y) || sok.room.map[y][x] === CONST.BLOCK.PERMANENT || sok.room.map[y][x] === CONST.BLOCK.NORMAL)
         return;
      
      if (sok.getMapName() === 'fourway') {
         if (CONST.MAP_FOURWAY_PORTAL_POSITIONS.filter(({x: xx, y: yy}) => (xx === x && yy === y)).length === 1) {
            return; // can't place bomb inside a portal
         }
      }
      
      if (sok.bombs === 0)
         return; // no bombs left
      
      // placing the bomb
      io.to(sok.roomname).emit('addBomb', x, y);
      if (sok.sick) {
         io.to(sok.roomname).emit('playsound', 'dropBombSick');
      }
      
      const tickFuncId = sok.room.ticks.addFunc(
         () => sok.explodeBomb(x, y, false),
         CONST.BOMB_TIMES[sok.bombTimeIndex] / sok.room.ticks.MSPT
      );
      
      sok.room.bombs.set(x, y, { owner: sok, length: sok.bombLength, tickFuncId });
      sok.bombs --;
   }
   
   
   // this function doesn't check if there is a bomb at map[y][x].
   sok.explodeBomb = (x, y, recursive) => {
      if (! sok.room)
         return;
      
      function breakLoop(blockCode) // a block before/on which the fire should stop.
         { return (blockCode === CONST.BLOCK.NORMAL || blockCode === CONST.BLOCK.PERMANENT || (5 <= blockCode && blockCode <= 13)); }
      
      const bomb = sok.room.bombs.get(x, y);
      const bombLength = bomb.length;
      sok.room.ticks.removeFunc(bomb.tickFuncId);
      sok.room.bombs.delete(x, y);
      io.to(sok.roomname).emit('deleteBomb', x, y);
      
      let fires = [];

      fires.push({x, y, owner: bomb.owner, oldBlock: sok.room.map[y][x], wasBomb: true});
      sok.room.map[y][x] = CONST.BLOCK.NO;

      for (let yy = y-1; yy >= Math.max(0, y - bombLength); --yy) {
         if (sok.room.bombs.has(x, yy)) {
            fires = fires.concat( sok.explodeBomb(x, yy, bombLength, true) );
            break;
         }
         if (sok.room.map[yy][x] !== CONST.BLOCK.PERMANENT)
            fires.push({x: x, y: yy, owner: bomb.owner, oldBlock: sok.room.map[yy][x], wasBomb: false});
         if (breakLoop(sok.room.map[yy][x]))
            break;
      }

      for (let yy = y+1; yy <= Math.min(CONST.BLOCKS_VERTICALLY-1, y + bombLength); ++yy) {
         if (sok.room.bombs.has(x, yy)) {
            fires = fires.concat( sok.explodeBomb(x, yy, bombLength, true) );
            break;
         }
         if (sok.room.map[yy][x] !== CONST.BLOCK.PERMANENT)
            fires.push({x: x, y: yy, owner: bomb.owner, oldBlock: sok.room.map[yy][x], wasBomb: false});
         if (breakLoop(sok.room.map[yy][x]))
            break;
      }

      for (let xx = x-1; xx >= Math.max(0, x - bombLength); --xx) {
         if (sok.room.bombs.has(xx, y)) {
            fires = fires.concat( sok.explodeBomb(xx, y, bombLength, true) );
            break;
         }
         if (sok.room.map[y][xx] !== CONST.BLOCK.PERMANENT)
            fires.push({x: xx, y: y, owner: bomb.owner, oldBlock: sok.room.map[y][xx], wasBomb: false});
         if (breakLoop(sok.room.map[y][xx]))
            break;
      }

      for (let xx = x+1; xx <= Math.min(CONST.BLOCKS_HORIZONTALLY-1, x + bombLength); ++xx) {
         if (sok.room.bombs.has(xx, y)) {
            fires = fires.concat( sok.explodeBomb(xx, y, bombLength, true) );
            break;
         }
         if (sok.room.map[y][xx] !== CONST.BLOCK.PERMANENT)
            fires.push({x: xx, y: y, owner: bomb.owner, oldBlock: sok.room.map[y][xx], wasBomb: false});
         if (breakLoop(sok.room.map[y][xx]))
            break;
      }

      if (recursive)
         return fires;
      
      fires.forEach((fire) => {
         const oldBombfire = sok.room.bombfires.get(fire.x, fire.y, fire.owner);
         let wasBomb = fire.wasBomb;
         if (oldBombfire) {
            sok.room.ticks.removeFunc(oldBombfire.tickFuncId);
            wasBomb = oldBombfire.wasBomb;
         } else {
            io.to(sok.roomname).emit('addBombfire', fire.x, fire.y);
         }
         
         const tickFuncId = sok.room.ticks.addFunc(
            () => fire.owner.removeBombfire(fire.x, fire.y),
            CONST.FIRE_TIME / sok.room.ticks.MSPT
         );
         sok.room.bombfires.set(fire.x, fire.y, fire.owner, { tickFuncId, oldBlock: fire.oldBlock, wasBomb });
      });
   }
   
   
   sok.removeBombfire = (x, y) => {
      const bombfire = sok.room.bombfires.get(x, y, sok);
      sok.room.bombfires.delete(x, y, sok);
      io.to(sok.roomname).emit('deleteBombfire', x, y);

      if (bombfire.oldBlock === CONST.BLOCK.NORMAL) {
         const rand = Math.floor(Math.random() * 18);
         let newBlock = CONST.BLOCK.NO;
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
         sok.room.map[y][x] = newBlock;
         io.to(sok.roomname).emit('mapUpdates', [{ x, y, block: newBlock }]);
      }

      io.to(sok.roomname).emit('removeBombfire', x, y);

      if (!sok.room[sok.color] || sok.dead)
         return;

      if (sok.bombs < 4 && bombfire.wasBomb) {
         sok.bombs ++;
      }

      sok.room.bombfires.delete(x, y, sok);
   }
}