// this function draws a block using block coordinates => x=0..15 and y=0.11
function drawBlock(block, xBlock, yBlock) {
   ctx.drawImage(block, OFFSET_LEFT + xBlock * BLOCK_SIZE, OFFSET_UP + yBlock * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// this function draws a player using normal coordinates WITHOUT OFFSET
function drawPlayer(player, x, y) {
   ctx.drawImage(player, OFFSET_LEFT + x, OFFSET_UP + y, BLOCK_SIZE, BLOCK_SIZE)
}