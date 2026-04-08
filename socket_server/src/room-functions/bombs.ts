import { WebSocket } from "ws";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, FIRE_TIME, isPowerup } from "../game-consts";
import { Block, Bomb, Flame } from "../game-types";
import { Room } from "../room";
import { OutPackets } from "../out-packets/out-packets";
import { logger } from "../log";


export function generate_getBomb(room: Room): (arg1: number, arg2?: number) => Bomb | undefined {
   return (arg1, arg2?): Bomb | undefined => {
      if (arg2 !== undefined) {
         // coords are arg1, arg2
         return room.bombs.find(bomb => Math.round(bomb.x) === arg1 && Math.round(bomb.y) === arg2);
      } else {
         // id is arg1
         const a = room.bombs.find(bomb => bomb.id === arg1);
         return a;
      }
   };
}

export function generate_getFlame(room: Room): (x: number, y: number, owner: WebSocket) => Flame | undefined {
   return (x, y, owner): Flame | undefined => {
      return room.flames.find(flame => flame.x === x && flame.y === y && flame.owner === owner);
   };
}


// call this only with bombId
export function generate_explodeBomb(room: Room): (bombId: number, recursive?: boolean, flames?: Flame[]) => void {
   return (bombId, recursive = false, flames = []) => {
      const bomb = room.getBomb(bombId);
      if (!bomb) {
         logger.error('explodeBomb: no bomb found');
         return [];
      }

      const bombOwner = bomb.owner;
      const bombLength = bomb.length;
      room.ticks.removeFunc(bomb.tickFuncId);
      room.bombs = room.bombs.filter(bomb => bomb.id !== bombId);
      OutPackets.send_deleteBomb(room, bombId);


      function explodeHelper(x: number, y: number): boolean {
         let tmpBomb: Bomb | undefined;
         if (tmpBomb = room.getBomb(x, y)) {
            room.explodeBomb(tmpBomb.id, true, flames);
         }
         if (room.grid[x][y] !== Block.PERMANENT &&
               flames.filter(flame => flame.x === x && flame.y === y && flame.owner === bombOwner).length === 0) {
            flames.push({ x: x, y: y, owner: bombOwner, oldBlock: room.grid[x][y], wasBomb: false, tickFuncId: undefined });
         }
         return breakLoop(room.grid[x][y]);
      }
      
      const x = Math.round(bomb.x);
      const y = Math.round(bomb.y);

      flames.push({ x: x, y: y, owner: bombOwner, oldBlock: room.grid[x][y], wasBomb: true, tickFuncId: undefined });
      room.grid[x][y] = Block.NO;


      for (let yy = y-1; yy >= Math.max(0, y - bombLength); --yy) {
         if (explodeHelper(x, yy)) {
            break;
         }
      }
      for (let yy = y+1; yy <= Math.min(BLOCKS_VERTICALLY-1, y + bombLength); ++yy) {
         if (explodeHelper(x, yy)) {
            break;
         }
      }
      for (let xx = x-1; xx >= Math.max(0, x - bombLength); --xx) {
         if (explodeHelper(xx, y)) {
            break;
         }
      }
      for (let xx = x+1; xx <= Math.min(BLOCKS_HORIZONTALLY-1, x + bombLength); ++xx) {
         if (explodeHelper(xx, y)) {
            break;
         }
      }

      if (recursive) {
         return; // let the main call handle all the flames
      }

      // 'flames' only contains unique triples <x,y,owner> now.
      // 'flames' means all the flames that we want to add.
      // let's see what triples we have already in room.flames, so we dont add twice.

      const flames2: Flame[] = [];
      flames.forEach((flame: Flame) => {
         const existingFlame = room.flames.find(
            roomFlame => roomFlame.x === flame.x && roomFlame.y === flame.y && roomFlame.owner === flame.owner
         );
         
         if (existingFlame) {
            // if we already had such triple, then replace its tickFuncId
            if (!existingFlame.tickFuncId) {
               return logger.error('explode error');
            }
            room.ticks.removeFunc(existingFlame.tickFuncId);
            existingFlame.tickFuncId = room.ticks.addFunc(
               () => room.removeFlame(existingFlame.x, existingFlame.y, existingFlame.owner),
               FIRE_TIME / room.ticks.MSPT
            );
         } else {
            flames2.push(flame);
         }
      });

      // flames2 now contains triples that we need to add.
      // we'll simply add & send all of them to clients.
      // clients are responsible to not draw pairs <x,y> more than once.
      flames2.forEach(flame => {
         flame.tickFuncId = room.ticks.addFunc(
            () => room.removeFlame(flame.x, flame.y, flame.owner),
            FIRE_TIME / room.ticks.MSPT
         );
         room.flames.push(flame);
         OutPackets.send_addFlame(room, flame.x, flame.y);
      });
   };
}


export function generate_removeFlame(room: Room): (x: number, y: number, owner: WebSocket) => void {
   return (x, y, owner) => {
      const flame = room.getFlame(x, y, owner);
      if (!flame) {
         return logger.error('error removeFlame');
      }

      room.flames = room.flames.filter(roomFlame => roomFlame !== flame);

      OutPackets.send_deleteFlame(room, x, y);

      if (flame.oldBlock === Block.NORMAL) {
         const rand = Math.floor(Math.random() * 18);
         let newBlock = Block.NO;
         if (rand > 7) {
            const rand = Math.floor(Math.random() * 14);
            
            if (rand === 0 || rand === 1 || rand === 2 || rand === 3)
               newBlock = Block.POWER_BOMBLENGTH;
            else if (rand === 4)
               newBlock = Block.POWER_BOMBPLUS;
            else if (rand === 5)
               newBlock = Block.POWER_BOMBTIME;
            else if (rand === 6)
               newBlock = Block.POWER_KICKBOMBS;
            else if (rand === 7 || rand === 8)
               newBlock = Block.POWER_SPEED;
            else if (rand === 9)
               newBlock = Block.POWER_SHIELD;
            else if (rand === 10)
               newBlock = Block.POWER_SWITCHPLAYER;
            else if (rand === 11)
               newBlock = Block.POWER_SICK;
            else if (rand === 12 || rand === 13)
               newBlock = Block.POWER_BONUS;
         }
         room.grid[x][y] = newBlock;
         OutPackets.send_gridUpdate(room, x, y, newBlock);
      } else if (isPowerup(flame.oldBlock)) {
         room.grid[x][y] = Block.NO;
         OutPackets.send_gridUpdate(room, x, y, Block.NO);
      }
   }
}


// a block before/on which the flame should stop; used in explodeBomb
function breakLoop(block: Block) {
   return (block === Block.NORMAL || block === Block.PERMANENT || isPowerup(block));
}