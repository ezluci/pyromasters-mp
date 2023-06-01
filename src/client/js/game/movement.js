'use strict'

// returns true if you CANNOT GO through this block
function stop(blockCode) {
   return (blockCode !== BLOCK.NO && blockCode !== BLOCK.FIRE && blockCode !== BLOCK.BOMB && !isPowerup(blockCode))
}


function moveLeft() {
   if (me.x === MIN_X)
      return

   if (me.x % BLOCK_SIZE === 0 && me.y % BLOCK_SIZE === 0 && me.x !== MIN_X && stop(map[me.y / BLOCK_SIZE][me.x / BLOCK_SIZE - 1]))
      return

   const mod = me.y % (2 * BLOCK_SIZE)

   if (mod === 0) {
      me.x -= moveSpeed * deltaTime
      if (me.x < MIN_X || stop(map[me.y / BLOCK_SIZE][Math.floor(me.x / BLOCK_SIZE)]))
         me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
   }
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return // next to the player is a block. we don't move anything.
   else {
      if (mod < BLOCK_SIZE && !stop(map[Math.floor(me.y / BLOCK_SIZE)][me.x / BLOCK_SIZE - 1])) {
         me.y -= moveSpeed * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x -= 2 * BLOCK_SIZE - newMod
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
      else if (mod > BLOCK_SIZE && !stop(map[Math.floor(me.y / BLOCK_SIZE) + 1][me.x / BLOCK_SIZE - 1])) {
         me.y += moveSpeed * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x -= newMod
            me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
   }
}

function moveDown() {
   if (me.y === MAX_Y)
      return
   
   if (me.x % BLOCK_SIZE === 0 && me.y % BLOCK_SIZE === 0 && me.y !== MAX_Y && stop(map[me.y / BLOCK_SIZE + 1][me.x / BLOCK_SIZE]))
      return
   
   const mod = me.x % (2 * BLOCK_SIZE)

   if (mod === 0) {
      me.y += moveSpeed * deltaTime
      if (me.y > MAX_Y || stop(map[Math.floor(me.y / BLOCK_SIZE) + 1][me.x / BLOCK_SIZE]))
         me.y = Math.floor(meOld.y / BLOCK_SIZE + 1) * BLOCK_SIZE
   }
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE && !stop(map[me.y / BLOCK_SIZE + 1][Math.floor(me.x / BLOCK_SIZE)])) {
         me.x -= moveSpeed * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y += 2 * BLOCK_SIZE - newMod
         }
      }
      else if (mod > BLOCK_SIZE && !stop(map[me.y / BLOCK_SIZE + 1][Math.floor(me.x / BLOCK_SIZE) + 1])) {
         me.x += moveSpeed * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y += newMod
         }
      }
   }
}

function moveRight() {
   if (me.x === MAX_X)
      return
   
   if (me.x % BLOCK_SIZE === 0 && me.y % BLOCK_SIZE === 0 && me.x !== MAX_X && stop(map[me.y / BLOCK_SIZE][me.x / BLOCK_SIZE + 1]))
      return
   
   const mod = me.y % (2 * BLOCK_SIZE)

   if (mod === 0) {
      me.x += moveSpeed * deltaTime
      if (me.x > MAX_X || stop(map[me.y / BLOCK_SIZE][Math.floor(me.x / BLOCK_SIZE) + 1]))
         me.x = Math.floor(meOld.x / BLOCK_SIZE + 1) * BLOCK_SIZE
   }
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE && !stop(map[Math.floor(me.y / BLOCK_SIZE)][me.x / BLOCK_SIZE + 1])) {
         me.y -= moveSpeed * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x += 2 * BLOCK_SIZE - newMod
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
      else if (mod > BLOCK_SIZE && !stop(map[Math.floor(me.y / BLOCK_SIZE) + 1][me.x / BLOCK_SIZE + 1])) {
         me.y += moveSpeed * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x += newMod
            me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
   }
}

function moveUp() {
   if (me.y === MIN_Y)
      return
   
   if (me.x % BLOCK_SIZE === 0 && me.y % BLOCK_SIZE === 0 && me.y !== MIN_Y && stop(map[me.y / BLOCK_SIZE - 1][me.x / BLOCK_SIZE]))
      return
   
   const mod = me.x % (2 * BLOCK_SIZE)

   if (mod === 0) {
      me.y -= moveSpeed * deltaTime
      if (me.y < MIN_Y || stop(map[Math.floor(me.y / BLOCK_SIZE)][me.x / BLOCK_SIZE]))
         me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
   }
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE && !stop(map[me.y / BLOCK_SIZE - 1][Math.floor(me.x / BLOCK_SIZE)])) {
         me.x -= moveSpeed * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y -= 2 * BLOCK_SIZE - newMod
         }
      }
      else if (mod > BLOCK_SIZE && !stop(map[me.y / BLOCK_SIZE - 1][Math.floor(me.x / BLOCK_SIZE) + 1])) {
         me.x += moveSpeed * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y -= newMod
         }
      }
   }
}