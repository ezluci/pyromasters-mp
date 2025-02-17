import { Socket } from "socket.io";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, FIRE_TIME, isPowerup } from "../game-consts";
import { Block, Coord, Flame } from "../game-types";
import { Room } from "../room";


export function generate_getBombIdByCoords(room: Room): (coord: Coord) => number | undefined {
   return ({x, y}) => {
      let id = undefined;
      room.bombs.forEach((bomb, bombId) => {
         if (Math.round(bomb.x) === x && Math.round(bomb.y) === y) {
            id = bombId;
         }
      });
      return id;
   };
}


export function generate_explodeBomb(room: Room): (bombId: number, recursive: boolean) => Flame[] {
   const io = room.owner.nsp.server;
   
   return (bombId, recursive) => {
      const bomb = room.bombs.get(bombId);
      if (!bomb) {
         console.error('explodeBomb: incorrect bombId');
         return [];
      }

      const bombLength = bomb.length;
      room.ticks.removeFunc(bomb.tickFuncId);
      room.bombs.delete(bombId);
      io.to(room.name).emit('deleteBomb', bombId);
      
      const x = Math.round(bomb.x);
      const y = Math.round(bomb.y);
      let fires: Flame[] = [];

      fires.push({ x: x, y: y, owner: bomb.owner, oldBlock: room.map[y][x], wasBomb: true, tickFuncId: undefined });
      room.map[y][x] = Block.NO;

      let tmpBombId: number | undefined;
      for (let yy = y-1; yy >= Math.max(0, y - bombLength); --yy) {
         if (tmpBombId = room.getBombIdByCoords({ x: x, y: yy} )) {
            fires = fires.concat( room.explodeBomb(tmpBombId, true) );
            break;
         }
         if (room.map[yy][x] !== Block.PERMANENT)
            fires.push({ x: x, y: yy, owner: bomb.owner, oldBlock: room.map[yy][x], wasBomb: false, tickFuncId: undefined });
         if (breakLoop(room.map[yy][x]))
            break;
      }

      for (let yy = y+1; yy <= Math.min(BLOCKS_VERTICALLY-1, y + bombLength); ++yy) {
         if (tmpBombId = room.getBombIdByCoords({ x: x, y: yy })) {
            fires = fires.concat( room.explodeBomb(tmpBombId, true) );
            break;
         }
         if (room.map[yy][x] !== Block.PERMANENT)
            fires.push({ x: x, y: yy, owner: bomb.owner, oldBlock: room.map[yy][x], wasBomb: false, tickFuncId: undefined });
         if (breakLoop(room.map[yy][x]))
            break;
      }

      for (let xx = x-1; xx >= Math.max(0, x - bombLength); --xx) {
         if (tmpBombId = room.getBombIdByCoords({ x: xx, y: y })) {
            fires = fires.concat( room.explodeBomb(tmpBombId, true) );
            break;
         }
         if (room.map[y][xx] !== Block.PERMANENT)
            fires.push({ x: xx, y: y, owner: bomb.owner, oldBlock: room.map[y][xx], wasBomb: false, tickFuncId: undefined });
         if (breakLoop(room.map[y][xx]))
            break;
      }

      for (let xx = x+1; xx <= Math.min(BLOCKS_HORIZONTALLY-1, x + bombLength); ++xx) {
         if (tmpBombId = room.getBombIdByCoords({ x: xx, y: y })) {
            fires = fires.concat( room.explodeBomb(tmpBombId, true) );
            break;
         }
         if (room.map[y][xx] !== Block.PERMANENT)
            fires.push({ x: xx, y: y, owner: bomb.owner, oldBlock: room.map[y][xx], wasBomb: false, tickFuncId: undefined });
         if (breakLoop(room.map[y][xx]))
            break;
      }

      if (recursive)
         return fires;
      
      fires.forEach((fire: Flame) => {
         const oldBombfire = room.flames.get(fire.x)?.get(fire.y)?.get(fire.owner);
         if (oldBombfire) {
            if (!oldBombfire.tickFuncId) {
               return console.error('explodebomb error 2');
            }
            room.ticks.removeFunc(oldBombfire.tickFuncId);
            if (oldBombfire.wasBomb) {
               fire.wasBomb = true;
            }
         } else {
            io.to(room.name).emit('addBombfire', fire.x, fire.y);
         }
         
         const tickFuncId = room.ticks.addFunc(
            () => room.removeFlame(fire.x, fire.y, fire.owner),
            FIRE_TIME / room.ticks.MSPT
         );
         fire.tickFuncId = tickFuncId;

         flamesSet(room.flames, fire.x, fire.y, fire.owner, fire);
      });

      return [];
   };
}


export function generate_removeFlame(room: Room): (x: number, y: number, owner: Socket) => void {
   const io = room.owner.nsp.server;
   return (x, y, owner) => {
      const flame: Flame | undefined = room.flames.get(x)?.get(y)?.get(owner);
      if (!flame) {
         return console.error('removeflame something wrong');
      }
      flamesDelete(room.flames, x, y, owner);
      io.to(room.name).emit('deleteBombfire', x, y);

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
         room.map[y][x] = newBlock;
         io.to(room.name).emit('mapUpdates', [{ x, y, block: newBlock }]);
      } else if (isPowerup(flame.oldBlock)) {
         room.map[y][x] = Block.NO;
         io.to(room.name).emit('mapUpdates', [{ x, y, block: Block.NO }]);
      }
   
      if (owner.bombCount < 4 && flame.wasBomb) {
         owner.bombCount ++;
      }
   }
}


// a block before/on which the fire should stop; used in explodeBomb
function breakLoop(block: Block) {
   return (block === Block.NORMAL || block === Block.PERMANENT || isPowerup(block));
}

// a helper function to set a value in the flames map
function flamesSet(flames: Map<number, Map<number, Map<Socket, Flame>>>, x: number, y: number, owner: Socket, flame: Flame) {
   if (!flames.has(x)) {
      flames.set(x, new Map<number, Map<Socket, Flame>>());
   }
   if (!flames.get(x)!.has(y)) {
      flames.get(x)!.set(y, new Map<Socket, Flame>());
   }
   flames.get(x)!.get(y)!.set(owner, flame);
}

// a helper function to delete a value in the flames map
function flamesDelete(flames: Map<number, Map<number, Map<Socket, Flame>>>, x: number, y: number, owner: Socket) {
   const xMap = flames.get(x);
   if (!xMap) {
      return;
   }
   const yMap = xMap.get(y);
   if (!yMap) {
      return;
   }
   yMap.delete(owner);
   if (yMap.size === 0) {
      xMap.delete(y);
      if (xMap.size === 0) {
         flames.delete(x);
      }
   }
}