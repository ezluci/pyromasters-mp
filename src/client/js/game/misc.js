'use strict';

function isPowerup(blockCode) {
   return (5 <= blockCode && blockCode <= 13);
}

// this function draws a block using block coordinates => xB=0..15 and yB=0.11
function drawBlock(block, xBlock, yBlock, manualOffset = 4) {
   // 53x53
   ctx.drawImage(
      block,
      OFFSET_LEFT + xBlock * BLOCK_SIZE + manualOffset,
      OFFSET_UP + yBlock * BLOCK_SIZE + manualOffset,
      BLOCK_SIZE - 2 * manualOffset,
      BLOCK_SIZE - 2 * manualOffset
   );
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
function drawPlayer(img, x, y) { 
   // 53x78
   ctx.drawImage(
      img,
      OFFSET_LEFT + x,
      OFFSET_UP + y - 25,
      53,
      78
   );
}

function loadImage(src) {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
   });
}