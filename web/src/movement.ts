import { BLOCK_SAFE_PX, BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAX_X, MAX_Y, MIN_X, MIN_Y } from "./game-consts";
import { Animation, Block, Bomb } from "./types";
import { sendPacket_kickBomb } from "./network/out-packets/kick-bomb";
import type { Game } from "./game";
import { Animations } from "./animations";

// returns true if you CANNOT GO through these coordinates (there is a thing at these INTEGER coords)
function stop(g: Game, x: number, y: number): boolean {
   x = Math.round(x);
   y = Math.round(y); // no division errors pls
   if (x < 0 || y < 0 || x >= BLOCKS_HORIZONTALLY || y >= BLOCKS_VERTICALLY) {
      return false;
   }
   return g.grid[y][x] === Block.NORMAL || g.grid[y][x] === Block.PERMANENT || getBomb(g, x, y) !== null;
}

// ok so the thing is that two bombs (x1, y1) and (x2, y2) cannot have the same coords,
//  no matter if the coords are floored/ceiled, aka
//  {floor(x1), ceil(x1)} intersects {floor(x2), ceil(x2)} AND {floor(y1), ceil(y1)} intersects {floor(y2), ceil(y2)}) cannot be true.
// this function returns a bomb that is EVEN PARTIALLY inside the INTEGER coords (x, y).
function getBomb(g: Game, x: number, y: number): Bomb | null {
   x = Math.round(x);
   y = Math.round(y); // no rounding errors!
   const filteredBombs = g.bombs.filter(bomb =>
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
function getBombExact(g: Game, x: number, y: number): Bomb | null {
   x = Math.round(x);
   y = Math.round(y); // once again
   const filteredBombs = g.bombs.filter(bomb => x === bomb.x && y === bomb.y);
   if (filteredBombs.length > 1) {
      console.error('2 bombs in the same place, wtf??');
   }
   if (filteredBombs.length) {
      return filteredBombs[0];
   }
   return null;
}



let tmpBomb: Bomb | null;

export function moveLeft(g: Game) {
   if (!g.myPlayer.color || g.myPlayer.dead) {
      return;
   }

   const me = g.myPlayer.coords;
   const meOld = { x: me.x, y: me.y };
   const speed = g.myPlayer.speed;

   const mod = me.y % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.x === MIN_X) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
      return; // next to the player is a block. we don't move anything.
   }

   if (mod === 0) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
      me.x -= speed * g.deltaTime;
      if (me.x < MIN_X) {
         me.x = MIN_X;
      } else if (Math.floor(me.x / BLOCK_SIZE) !== Math.floor(meOld.x / BLOCK_SIZE)) { // if we go in a different block
         if (stop(g, Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE)) {
            me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.x % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE - 1, me.y / BLOCK_SIZE))) {
         sendPacket_kickBomb(g, tmpBomb, -1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) { // move up
         if (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
            sendPacket_kickBomb(g, tmpBomb, -1, 0);
         } else if (!stop(g, me.x / BLOCK_SIZE - 1, Math.floor(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
            me.y -= speed * g.deltaTime;
            me.y = Math.max(me.y, MIN_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
               me.x -= 2 * BLOCK_SIZE - newMod;
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
         }
      } else if (mod > BLOCK_SIZE) { // move down
         if (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE - 1, Math.ceil(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
            sendPacket_kickBomb(g, tmpBomb, -1, 0);
         } else if (!stop(g, me.x / BLOCK_SIZE - 1, Math.ceil(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
            me.y += speed * g.deltaTime;
            me.y = Math.min(me.y, MAX_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
               me.x -= newMod;
               me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
         }
      }
   }
}


export function moveDown(g: Game) {
   if (!g.myPlayer.color || g.myPlayer.dead) {
      return;
   }

   const me = g.myPlayer.coords;
   const meOld = { x: me.x, y: me.y };
   const speed = g.myPlayer.speed;

   const mod = me.x % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.y === MAX_Y) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
      return;
   }
   
   if (mod === 0) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
      me.y += speed * g.deltaTime;
      if (me.y > MAX_Y) {
         me.y = MAX_Y;
      } else if (Math.ceil(me.y / BLOCK_SIZE) !== Math.ceil(meOld.y / BLOCK_SIZE)) {
         if (stop(g, me.x / BLOCK_SIZE, Math.ceil(me.y / BLOCK_SIZE))) {
            me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.y % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE, me.y / BLOCK_SIZE + 1))) {
         sendPacket_kickBomb(g, tmpBomb, 0, +1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
            sendPacket_kickBomb(g, tmpBomb, 0, +1);
         } else if (!stop(g, Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
            me.x -= speed * g.deltaTime;
            me.x = Math.max(me.x, MIN_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
               me.y += 2 * BLOCK_SIZE - newMod;
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
         }
      } else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
            sendPacket_kickBomb(g, tmpBomb, 0, +1);
         } else if (!stop(g, Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE + 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
            me.x += speed * g.deltaTime;
            me.x = Math.min(me.x, MAX_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
               me.y += newMod;
               me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
         }
      }
   }
}


export function moveRight(g: Game) {
   if (!g.myPlayer.color || g.myPlayer.dead) {
      return;
   }

   const me = g.myPlayer.coords;
   const meOld = { x: me.x, y: me.y };
   const speed = g.myPlayer.speed;
   
   const mod = me.y % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.x === MAX_X) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
      return;
   }
   
   if (mod === 0) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
      me.x += speed * g.deltaTime;
      if (me.x > MAX_X) {
         me.x = MAX_X;
      } else if (Math.ceil(me.x / BLOCK_SIZE) !== Math.ceil(meOld.x / BLOCK_SIZE)) {
         if (stop(g, Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE)) {
            me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.x % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE + 1, me.y / BLOCK_SIZE))) {
         sendPacket_kickBomb(g, tmpBomb, +1, 0);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
            sendPacket_kickBomb(g, tmpBomb, +1, 0);
         } else if (!stop(g, me.x / BLOCK_SIZE + 1, Math.floor(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
            me.y -= speed * g.deltaTime;
            me.y = Math.max(me.y, MIN_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
               me.x += 2 * BLOCK_SIZE - newMod;
               me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE + 1, Math.ceil(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
            sendPacket_kickBomb(g, tmpBomb, +1, 0);
         } else if (!stop(g, me.x / BLOCK_SIZE + 1, Math.ceil(me.y / BLOCK_SIZE))) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_FRONT);
            me.y += speed * g.deltaTime;
            me.y = Math.min(me.y, MAX_Y);
            const newMod = me.y % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
               me.x += newMod;
               me.y = Math.ceil(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
         }
      }
   }
}


export function moveUp(g: Game) {
   if (!g.myPlayer.color || g.myPlayer.dead) {
      return;
   }

   const me = g.myPlayer.coords;
   const meOld = { x: me.x, y: me.y };
   const speed = g.myPlayer.speed;
   
   const mod = me.x % (2 * BLOCK_SIZE);

   if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX || me.y === MIN_Y) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
      return;
   }

   if (mod === 0) {
      Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
      me.y -= speed * g.deltaTime;
      if (me.y < MIN_Y) {
         me.y = MIN_Y;
      } else if (Math.floor(me.y / BLOCK_SIZE) !== Math.floor(meOld.y / BLOCK_SIZE)) {
         if (stop(g, me.x / BLOCK_SIZE, Math.floor(me.y / BLOCK_SIZE))) {
            me.y = Math.floor(meOld.y / BLOCK_SIZE) * BLOCK_SIZE;
         }
      }
      if (me.y % BLOCK_SIZE === 0 && (tmpBomb = getBombExact(g, me.x / BLOCK_SIZE, me.y / BLOCK_SIZE - 1))) {
         sendPacket_kickBomb(g, tmpBomb, 0, -1);
      }
   } else {
      if (mod < BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
            sendPacket_kickBomb(g, tmpBomb, 0, -1);
         } else if (!stop(g, Math.floor(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_LEFT);
            me.x -= speed * g.deltaTime;
            me.x = Math.max(me.x, MIN_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod > mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
               me.y -= 2 * BLOCK_SIZE - newMod;
               me.x = Math.floor(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
         }
      }
      else if (mod > BLOCK_SIZE) {
         if (tmpBomb = getBombExact(g, Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
            sendPacket_kickBomb(g, tmpBomb, 0, -1);
         } else if (!stop(g, Math.ceil(me.x / BLOCK_SIZE), me.y / BLOCK_SIZE - 1)) {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_RIGHT);
            me.x += speed * g.deltaTime;
            me.x = Math.min(me.x, MAX_X);
            const newMod = me.x % (2 * BLOCK_SIZE);
            if (newMod < mod) {
               Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
               me.y -= newMod;
               me.x = Math.ceil(meOld.x / BLOCK_SIZE) * BLOCK_SIZE;
            }
         } else {
            Animations.changeAnimation(g.myPlayer, Animation.WALK_BACK);
         }
      }
   }
}