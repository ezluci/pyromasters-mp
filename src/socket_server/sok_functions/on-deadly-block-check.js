'use strict';

const CONST = require('../consts');

const BLK = CONST.BLOCK_SIZE;
const BLK_SAFE = CONST.BLOCK_SAFE_PX;

module.exports = (io, sok) => {
   sok.onDeadlyBlockCheck = (color) => {
      const x = sok.coords.x
      const y = sok.coords.y
      
      let deadlyBlock1 = { ...CONST.INEXISTENT_POS }
      let deadlyBlock2 = { ...CONST.INEXISTENT_POS }

      if (x % BLK === 0 && y % BLK === 0) {
         deadlyBlock1 = {x: x / BLK, y: y / BLK}
      }
      else if (x % BLK === 0) {
         const mod = y % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadlyBlock1 = {x: x / BLK, y: Math.floor(y / BLK)}
            else
               deadlyBlock1 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         } else {
            deadlyBlock1 = {x: x / BLK, y: Math.floor(y / BLK)}
            deadlyBlock2 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         }
      } else if (y % BLK === 0) {
         const mod = x % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadlyBlock1 = {x: Math.floor(x / BLK), y: y / BLK}
            else
               deadlyBlock1 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         } else {
            deadlyBlock1 = {x: Math.floor(x / BLK), y: y / BLK}
            deadlyBlock2 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         }
      } else {
         return;  // he's messing with the coords =[
      }

      let death = (sok.room.map[deadlyBlock1.y][deadlyBlock1.x] === CONST.BLOCK.PERMANENT ||
            (deadlyBlock2.x !== CONST.INEXISTENT_POS.x && sok.room.map[deadlyBlock2.y][deadlyBlock2.x] === CONST.BLOCK.PERMANENT));
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (sok.room.bombfires.has(deadlyBlock1.x, deadlyBlock1.y, sok.room[color])) {
            death = true;
         }
         if (sok.room.bombfires.has(deadlyBlock2.x, deadlyBlock2.y, sok.room[color])) {
            death = true;
         }
      });
      
      return death;
   }
};