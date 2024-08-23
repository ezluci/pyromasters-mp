'use strict';

// returns true if you CANNOT GO through these coordinates (there is a thing at these coords)
function stop(x, y) {
   return (
      map[y][x] === BLOCK.NORMAL || map[y][x] === BLOCK.PERMANENT || isbomb(x, y)
   );
}

function isbomb(x, y) {
   return bombs.filter(({x: xb, y: yb}) => x === xb && y === yb).length === 1;
}


function moveLeft() {
   changeAnimation(myColor, 'left');
   
   if (me.x === MIN_X)
      return

   const mod = me.y % (2 * BLOCK_SIZE)

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return; // next to the player is a block. we don't move anything.
   
   const A = {x: Math.floor(me.x / BLOCK_SIZE), y: Math.floor(me.y / BLOCK_SIZE)};
   const B = {x: Math.ceil(me.x / BLOCK_SIZE), y: Math.ceil(me.y / BLOCK_SIZE)};
   
   let oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(A.x === xb && A.y === yb));
   if (oldLength !== bombs.length)  A.wasBomb = true;
   
   oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(B.x === xb && B.y === yb));
   if (oldLength !== bombs.length)  B.wasBomb = true;

   if (mod === 0) {
      me.x -= moveSpeed * deltaTime
      if (me.x < MIN_X || stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE))
         me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
      if (me.x % BLOCK_SIZE === 0 && isbomb(me.x / BLOCK_SIZE - 1, me.y / BLOCK_SIZE)) {
         socket.emit('kickbomb', me.x / BLOCK_SIZE - 1, me.y / BLOCK_SIZE, -1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (isbomb(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            socket.emit('kickbomb', me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE), -1, 0);
         }
         if (!stop(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            me.y -= moveSpeed * deltaTime
            const newMod = me.y % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               me.x -= 2 * BLOCK_SIZE - newMod
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (isbomb(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE) + 1)) {
            socket.emit('kickbomb', me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE) + 1, -1, 0);
         }
         if (!stop(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE) + 1)) {
            me.y += moveSpeed * deltaTime
            const newMod = me.y % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               me.x -= newMod
               me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
   }

   if (A.wasBomb) bombs.push({x: A.x, y: A.y})
   if (B.wasBomb) bombs.push({x: B.x, y: B.y})
}


function moveDown() {
   changeAnimation(myColor, 'front');
   
   if (me.y === MAX_Y)
      return
   
   const mod = me.x % (2 * BLOCK_SIZE)

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return; // next to the player is a block. we don't move anything.
   
   const A = {x: Math.floor(me.x / BLOCK_SIZE), y: Math.floor(me.y / BLOCK_SIZE)};
   const B = {x: Math.ceil(me.x / BLOCK_SIZE), y: Math.ceil(me.y / BLOCK_SIZE)};
   
   let oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(A.x === xb && A.y === yb));
   if (oldLength !== bombs.length)  A.wasBomb = true;
   
   oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(B.x === xb && B.y === yb));
   if (oldLength !== bombs.length)  B.wasBomb = true;
   
   if (mod === 0) {
      me.y += moveSpeed * deltaTime
      if (me.y > MAX_Y || stop(me.x / BLOCK_SIZE, Math.floor(me.y / BLOCK_SIZE) + 1))
         me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
      if (me.y % BLOCK_SIZE === 0 && isbomb(me.x / BLOCK_SIZE, me.y / BLOCK_SIZE + 1)) {
         socket.emit('kickbomb', me.x / BLOCK_SIZE, me.y / BLOCK_SIZE + 1, 0, +1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (isbomb(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            socket.emit('kickbomb', Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1, 0, +1);
         }
         if (!stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            me.x -= moveSpeed * deltaTime
            const newMod = me.x % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
               me.y += 2 * BLOCK_SIZE - newMod
            }
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (isbomb(Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE + 1)) {
            socket.emit('kickbomb', Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE + 1, 0, +1);
         }
         if (!stop(Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE + 1)) {
            me.x += moveSpeed * deltaTime
            const newMod = me.x % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
               me.y += newMod
            }
         }
      }
   }

   if (A.wasBomb) bombs.push({x: A.x, y: A.y})
   if (B.wasBomb) bombs.push({x: B.x, y: B.y})
}


function moveRight() {
   changeAnimation(myColor, 'right');
   
   if (me.x === MAX_X)
      return
   
   const mod = me.y % (2 * BLOCK_SIZE)

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return; // next to the player is a block. we don't move anything.

   const A = {x: Math.floor(me.x / BLOCK_SIZE), y: Math.floor(me.y / BLOCK_SIZE)};
   const B = {x: Math.ceil(me.x / BLOCK_SIZE), y: Math.ceil(me.y / BLOCK_SIZE)};
   
   let oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(A.x === xb && A.y === yb));
   if (oldLength !== bombs.length)  A.wasBomb = true;
   
   oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(B.x === xb && B.y === yb));
   if (oldLength !== bombs.length)  B.wasBomb = true;
   
   if (mod === 0) {
      me.x += moveSpeed * deltaTime
      if (me.x > MAX_X || stop(Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE))
         me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
      if (me.x % BLOCK_SIZE === 0 && isbomb(me.x / BLOCK_SIZE + 1, me.y / BLOCK_SIZE)) {
         socket.emit('kickbomb', me.x / BLOCK_SIZE + 1, me.y / BLOCK_SIZE, +1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (isbomb(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            socket.emit('kickbomb', me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE), +1, 0);
         }
         if (!stop(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            me.y -= moveSpeed * deltaTime
            const newMod = me.y % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               me.x += 2 * BLOCK_SIZE - newMod
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (isbomb(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE) + 1)) {
            socket.emit('kickbomb', me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE) + 1, +1, 0);
         }
         if (!stop(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE) + 1)) {
            me.y += moveSpeed * deltaTime
            const newMod = me.y % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               me.x += newMod
               me.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
   }

   if (A.wasBomb) bombs.push({x: A.x, y: A.y})
   if (B.wasBomb) bombs.push({x: B.x, y: B.y})
}


function moveUp() {
   changeAnimation(myColor, 'back');

   if (me.y === MIN_Y)
      return
   
   const mod = me.x % (2 * BLOCK_SIZE)

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
      return; // next to the player is a block. we don't move anything.
   
   const A = {x: Math.floor(me.x / BLOCK_SIZE), y: Math.floor(me.y / BLOCK_SIZE)};
   const B = {x: Math.ceil(me.x / BLOCK_SIZE), y: Math.ceil(me.y / BLOCK_SIZE)};
   
   let oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(A.x === xb && A.y === yb));
   if (oldLength !== bombs.length)  A.wasBomb = true;
   
   oldLength = bombs.length;
   bombs = bombs.filter(({x: xb, y: yb}) => !(B.x === xb && B.y === yb));
   if (oldLength !== bombs.length)  B.wasBomb = true;
   
   if (mod === 0) {
      me.y -= moveSpeed * deltaTime
      if (me.y < MIN_Y || stop(me.x / BLOCK_SIZE, Math.floor(me.y / BLOCK_SIZE)))
         me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE
      if (me.y % BLOCK_SIZE === 0 && isbomb(me.x / BLOCK_SIZE, me.y / BLOCK_SIZE - 1)) {
         socket.emit('kickbomb', me.x / BLOCK_SIZE, me.y / BLOCK_SIZE - 1, 0, -1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (isbomb(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            socket.emit('kickbomb', Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1, 0, -1);
         }
         if (!stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            me.x -= moveSpeed * deltaTime
            const newMod = me.x % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE
               me.y -= 2 * BLOCK_SIZE - newMod
            }
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (isbomb(Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE - 1)) {
            socket.emit('kickbomb', Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE - 1, 0, -1);
         }
         if (!stop(Math.floor(me.x / BLOCK_SIZE) + 1, me.y / BLOCK_SIZE - 1)) {
            me.x += moveSpeed * deltaTime
            const newMod = me.x % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               me.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
               me.y -= newMod
            }
         }
      }
   }

   if (A.wasBomb) bombs.push({x: A.x, y: A.y})
   if (B.wasBomb) bombs.push({x: B.x, y: B.y})
}