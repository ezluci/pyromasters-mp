import { changeAnimation } from "./animations/process-animations";
import { BLOCK_SAFE_PX, BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAX_X, MAX_Y, MIN_X, MIN_Y } from "./game-consts";
import { socket } from "./game-socket";
import { Animation, Block, type Bomb, type Coord } from "./game-types";
import { bombs, coords, deltaTime, map, myColor, speed } from "./game-variables";

// returns true if you CANNOT GO through these coordinates (there is a thing at these INTEGER coords)
function stop(x: number, y: number): boolean {
   x = Math.round(x);
   y = Math.round(y); // no division errors pls
   if (x < 0 || y < 0 || x >= BLOCKS_HORIZONTALLY || y >= BLOCKS_VERTICALLY) {
      return false;
   }
   return map[y][x] === Block.NORMAL || map[y][x] === Block.PERMANENT || getBomb(x, y) !== null;
}

// ok so the thing is that two bombs (x1, y1) and (x2, y2) cannot have the same coords,
//  no matter if the coords are floored/ceiled, aka
//  {floor(x1), ceil(x1)} intersects {floor(x2), ceil(x2)} AND {floor(y1), ceil(y1)} intersects {floor(y2), ceil(y2)}) cannot be true.
// this function returns a bomb that is EVEN PARTIALLY inside the INTEGER coords (x, y).
function getBomb(x: number, y: number): Bomb | null {
   x = Math.round(x);
   y = Math.round(y); // no rounding errors!
   const filteredBombs = bombs.filter(bomb =>
      (x === Math.floor(bomb.x) || x === Math.ceil(bomb.x)) &&
      (y === Math.floor(bomb.y) || y === Math.ceil(bomb.y))
   );
   if (filteredBombs.length > 1) {
      console.error('2 bombs in the same place, wtf!');
   }
   if (filteredBombs.length) {
      return filteredBombs[0];
   }
   return null;
}

// same function as above, but returns the bomb that is exactly at the INTEGER coords (x, y).
function getBombExact(x: number, y: number): Bomb | null {
   x = Math.round(x);
   y = Math.round(y); // once again
   const filteredBombs = bombs.filter(bomb => x === bomb.x && y === bomb.y);
   if (filteredBombs.length > 1) {
      console.error('2 bombs in the same place, wtf??');
   }
   if (filteredBombs.length) {
      return filteredBombs[0];
   }
   return null;
}



let tmpBomb: Bomb | null;

export function moveLeft() {
   if (myColor === null) {
      return;
   }
   const me = coords[myColor];
   const meOld: Coord = { x: me.x, y: me.y };

   const mod = me.y % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.x === MIN_X) {
      changeAnimation(myColor, Animation.WALK_LEFT);
      return; // next to the player is a block. we don't move anything.
   }

   if (mod === 0) {
      changeAnimation(myColor, Animation.WALK_LEFT);
      me.x -= speed * deltaTime;
      if (me.x < MIN_X) {
         me.x = MIN_X;
      } else if (Math.floor(me.x / BLOCK_SIZE) !== Math.floor(meOld.x / BLOCK_SIZE)) { // if we go in a different block
         if (stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE)) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.x % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(me.x / BLOCK_SIZE - 1, me.y / BLOCK_SIZE))) {
         socket.emit('kickbomb', tmpBomb.id, -1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) { // move up
         if (tmpBomb = getBombExact(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_LEFT);
            socket.emit('kickbomb', tmpBomb.id, -1, 0);
         } else if (!stop(me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_BACK);
            me.y -= speed * deltaTime;
            me.y = Math.max(me.y, MIN_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               changeAnimation(myColor, Animation.WALK_LEFT);
               me.x -= 2 * BLOCK_SIZE - newMod;
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_LEFT);
         }
      } else if (mod > BLOCK_SIZE) { // move down
         if (tmpBomb = getBombExact(me.x / BLOCK_SIZE - 1, Math.ceil(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_LEFT);
            socket.emit('kickbomb', tmpBomb.id, -1, 0);
         } else if (!stop(me.x / BLOCK_SIZE - 1, Math.ceil(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_FRONT);
            me.y += speed * deltaTime;
            me.y = Math.min(me.y, MAX_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               changeAnimation(myColor, Animation.WALK_LEFT);
               me.x -= newMod;
               me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_LEFT);
         }
      }
   }
}


export function moveDown() {
   if (myColor === null) {
      return;
   }
   const me = coords[myColor];
   const meOld: Coord = { x: me.x, y: me.y };

   const mod = me.x % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.y === MAX_Y) {
      changeAnimation(myColor, Animation.WALK_FRONT);
      return;
   }
   
   if (mod === 0) {
      changeAnimation(myColor, Animation.WALK_FRONT);
      me.y += speed * deltaTime;
      if (me.y > MAX_Y) {
         me.y = MAX_Y;
      } else if (Math.ceil(me.y / BLOCK_SIZE) !== Math.ceil(meOld.y / BLOCK_SIZE)) {
         if (stop(me.x / BLOCK_SIZE, Math.ceil(me.y / BLOCK_SIZE))) {
            me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.y % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(me.x / BLOCK_SIZE, me.y / BLOCK_SIZE + 1))) {
         socket.emit('kickbomb', tmpBomb.id, 0, +1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            changeAnimation(myColor, Animation.WALK_FRONT);
            socket.emit('kickbomb', tmpBomb.id, 0, +1);
         } else if (!stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            changeAnimation(myColor, Animation.WALK_LEFT);
            me.x -= speed * deltaTime;
            me.x = Math.max(me.x, MIN_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               changeAnimation(myColor, Animation.WALK_FRONT);
               me.y += 2 * BLOCK_SIZE - newMod;
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_FRONT);
         }
      } else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            changeAnimation(myColor, Animation.WALK_FRONT);
            socket.emit('kickbomb', tmpBomb.id, 0, +1);
         } else if (!stop(Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            changeAnimation(myColor, Animation.WALK_RIGHT);
            me.x += speed * deltaTime;
            me.x = Math.min(me.x, MAX_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               changeAnimation(myColor, Animation.WALK_FRONT);
               me.y += newMod;
               me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_FRONT);
         }
      }
   }
}


export function moveRight() {
   if (myColor === null) {
      return;
   }
   const me = coords[myColor];
   const meOld: Coord = { x: me.x, y: me.y };
   
   const mod = me.y % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.x === MAX_X) {
      changeAnimation(myColor, Animation.WALK_RIGHT);
      return;
   }
   
   if (mod === 0) {
      changeAnimation(myColor, Animation.WALK_RIGHT);
      me.x += speed * deltaTime;
      if (me.x > MAX_X) {
         me.x = MAX_X;
      } else if (Math.ceil(me.x / BLOCK_SIZE) !== Math.ceil(meOld.x / BLOCK_SIZE)) {
         if (stop(Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE)) {
            me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.x % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(me.x / BLOCK_SIZE + 1, me.y / BLOCK_SIZE))) {
         socket.emit('kickbomb', tmpBomb.id, +1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_RIGHT);
            socket.emit('kickbomb', tmpBomb.id, +1, 0);
         } else if (!stop(me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_BACK);
            me.y -= speed * deltaTime;
            me.y = Math.max(me.y, MIN_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               changeAnimation(myColor, Animation.WALK_RIGHT);
               me.x += 2 * BLOCK_SIZE - newMod;
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_RIGHT);
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(me.x / BLOCK_SIZE + 1, Math.ceil(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_RIGHT);
            socket.emit('kickbomb', tmpBomb.id, +1, 0);
         } else if (!stop(me.x / BLOCK_SIZE + 1, Math.ceil(me.y / BLOCK_SIZE))) {
            changeAnimation(myColor, Animation.WALK_FRONT);
            me.y += speed * deltaTime;
            me.y = Math.min(me.y, MAX_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               changeAnimation(myColor, Animation.WALK_RIGHT);
               me.x += newMod;
               me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_RIGHT);
         }
      }
   }
}


export function moveUp() {
   if (myColor === null) {
      return;
   }
   const me = coords[myColor];
   const meOld: Coord = { x: me.x, y: me.y };
   
   const mod = me.x % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.y === MIN_Y) {
      changeAnimation(myColor, Animation.WALK_BACK);
      return;
   }

   if (mod === 0) {
      changeAnimation(myColor, Animation.WALK_BACK);
      me.y -= speed * deltaTime;
      if (me.y < MIN_Y) {
         me.y = MIN_Y;
      } else if (Math.floor(me.y / BLOCK_SIZE) !== Math.floor(meOld.y / BLOCK_SIZE)) {
         if (stop(me.x / BLOCK_SIZE, Math.floor(me.y / BLOCK_SIZE))) {
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.y % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(me.x / BLOCK_SIZE, me.y / BLOCK_SIZE - 1))) {
         socket.emit('kickbomb', tmpBomb.id, 0, -1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            changeAnimation(myColor, Animation.WALK_BACK);
            socket.emit('kickbomb', tmpBomb.id, 0, -1);
         } else if (!stop(Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            changeAnimation(myColor, Animation.WALK_LEFT);
            me.x -= speed * deltaTime;
            me.x = Math.max(me.x, MIN_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               changeAnimation(myColor, Animation.WALK_BACK);
               me.y -= 2 * BLOCK_SIZE - newMod;
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_BACK);
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            changeAnimation(myColor, Animation.WALK_BACK);
            socket.emit('kickbomb', tmpBomb.id, 0, -1);
         } else if (!stop(Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            changeAnimation(myColor, Animation.WALK_RIGHT);
            me.x += speed * deltaTime;
            me.x = Math.min(me.x, MAX_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               changeAnimation(myColor, Animation.WALK_BACK);
               me.y -= newMod;
               me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            changeAnimation(myColor, Animation.WALK_BACK);
         }
      }
   }
}