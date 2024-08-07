'use strict';

const CONST = require('../consts');

const BLK = CONST.BLOCK_SIZE;
const BLK_SAFE = CONST.BLOCK_SAFE_PX;

module.exports = (io, sok) => {
   sok.isDying = () => {
      if (sok.getShield()) {
         return false;
      }
      
      const x = sok.coords.x
      const y = sok.coords.y
      
      let deadBlk1 = { ...CONST.INEXISTENT_POS }
      let deadBlk2 = { ...CONST.INEXISTENT_POS }

      if (x % BLK === 0 && y % BLK === 0) {
         deadBlk1 = {x: x / BLK, y: y / BLK}
      }
      else if (x % BLK === 0) {
         const mod = y % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK)}
            else
               deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         } else {
            deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK)}
            deadBlk2 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         }
      } else if (y % BLK === 0) {
         const mod = x % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadBlk1 = {x: Math.floor(x / BLK), y: y / BLK}
            else
               deadBlk1 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         } else {
            deadBlk1 = {x: Math.floor(x / BLK), y: y / BLK}
            deadBlk2 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         }
      } else {
         return;  // he's messing with the coords =[
      }

      let death = (sok.room.map[deadBlk1.y][deadBlk1.x] === CONST.BLOCK.PERMANENT ||
               sok.room.map[deadBlk2.y]?.[deadBlk2.x] === CONST.BLOCK.PERMANENT);
      
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (sok.room.bombfires.has(deadBlk1.x, deadBlk1.y, sok.room[color])) {
            death = true;
         }
         if (sok.room.bombfires.has(deadBlk2.x, deadBlk2.y, sok.room[color])) {
            death = true;
         }
      });
      
      return death;
   }
};