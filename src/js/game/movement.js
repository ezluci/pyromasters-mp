function moveLeft() {
   if (meOld.x === MIN_X)
      return
   
   const mod = meOld.y % (2 * BLOCK_SIZE)

   if (mod === 0)
      me.x -= MOVE_SPEED * deltaTime
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return // next to the player is a block. we don't move anything.
   else {
      if (mod < BLOCK_SIZE) {
         me.y -= MOVE_SPEED * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x -= 2 * BLOCK_SIZE - newMod
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
      else {
         me.y += MOVE_SPEED * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x -= newMod
            me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
   }
}

function moveDown() {
   if (meOld.y === MAX_Y)
      return
   
   const mod = meOld.x % (2 * BLOCK_SIZE)

   if (mod === 0)
      me.y += MOVE_SPEED * deltaTime
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE) {
         me.x -= MOVE_SPEED * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y += 2 * BLOCK_SIZE - newMod
         }
      }
      else {
         me.x += MOVE_SPEED * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y += newMod
         }
      }
   }
}

function moveRight() {
   if (meOld.x === MAX_X)
      return
   
   const mod = meOld.y % (2 * BLOCK_SIZE)

   if (mod === 0)
      me.x += MOVE_SPEED * deltaTime
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE) {
         me.y -= MOVE_SPEED * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x += 2 * BLOCK_SIZE - newMod
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
      else {
         me.y += MOVE_SPEED * deltaTime
         const newMod = me.y % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x += newMod
            me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
         }
      }
   }
}

function moveUp() {
   if (meOld.y === MIN_Y)
      return
   
   const mod = meOld.x % (2 * BLOCK_SIZE)

   if (mod === 0)
      me.y -= MOVE_SPEED * deltaTime
   else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return
   else {
      if (mod < BLOCK_SIZE) {
         me.x -= MOVE_SPEED * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod > mod) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y -= 2 * BLOCK_SIZE - newMod
         }
      }
      else {
         me.x += MOVE_SPEED * deltaTime
         const newMod = me.x % (2 * BLOCK_SIZE)
         if (newMod < mod) {
            me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
            me.y -= newMod
         }
      }
   }
}