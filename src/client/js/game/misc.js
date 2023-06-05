'use strict';

// this function transforms an index 0..4 to a color.
function indexToColor(idx) {
   if (idx === 0) return 'white'
   if (idx === 1) return 'black'
   if (idx === 2) return 'orange'
   if (idx === 3) return 'green'
   console.error('?')
}

function isPowerup(blockCode) {
   return 5 <= blockCode && blockCode <= 13
}

// this function draws a block using block coordinates => xB=0..15 and yB=0.11
function drawBlock(block, xBlock, yBlock) {
   ctx.drawImage(block, OFFSET_LEFT + xBlock * BLOCK_SIZE, OFFSET_UP + yBlock * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
function drawPlayer(img, x, y) { 
   // 53x78
   ctx.drawImage(img, OFFSET_LEFT + x, OFFSET_UP + y - 25, 53, 78)
}

function loadImage(src) {
   return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
   })
}