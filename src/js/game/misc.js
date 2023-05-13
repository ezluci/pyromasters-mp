// this function transforms an index 0..4 to a color.
function indexToColor(idx) {
   if (idx === 0) return 'white'
   if (idx === 1) return 'black'
   if (idx === 2) return 'orange'
   if (idx === 3) return 'green'
   console.error('?')
}

// this function draws a block using block coordinates => xB=0..15 and yB=0.11
function drawBlock(block, xBlock, yBlock) {
   ctx.drawImage(block, OFFSET_LEFT + xBlock * BLOCK_SIZE, OFFSET_UP + yBlock * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
function drawPlayer(player, x, y) {
   ctx.drawImage(player, OFFSET_LEFT + x, OFFSET_UP + y, BLOCK_SIZE, BLOCK_SIZE)
}