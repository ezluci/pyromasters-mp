import { Server, Socket } from "socket.io";
import { Animation, Block, Color, Coord } from "./game-types";
import { ALL_COLORS, BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, END_SCREEN_TIMEOUT, isPowerup, KICK_BOMB_SPEED } from "./game-consts";



// this GENERATES the runEveryTick function that is going to be passed into the Ticks class
export function generate_runEveryTick(sok: Socket): () => void {
   const io = sok.nsp.server;
   return () => {
      // send coordinates to everyone
      const coords: [number, number, Animation][] = [];
      ALL_COLORS.forEach(color => {
         if (!sok.room[color]) {
            coords.push([0, 0, Animation.IDLE]);
         } else {
            coords.push([sok.room[color].coords.x, sok.room[color].coords.y, sok.room[color].animState]);
         }
      });
      io.to(sok.room.name).emit('C', coords);
      
      // check deaths
      ALL_COLORS.forEach(color => {
         if (!sok.room[color] || sok.room[color].dead) {
            return;
         }
         
         const deathStatus: boolean | Color[] = sok.room[color].isDying();
         if (typeof deathStatus === 'boolean') { // didn't die
            return;
         }
         
         sok.room.countPlayersAlive --;
         io.to(sok.room.name).emit('death', color);

         sok.room[color].dead = true;

         deathStatus.forEach(assistColor => {
            if (assistColor !== color) { // don't count own death
               if (sok.room[assistColor]) {
                  sok.room[assistColor].kills ++;
               }
            }
         });
      });
      
      // check players who are sick
      ALL_COLORS.forEach(color => {
         if (sok.room[color]?.sick) {
            sok.room[color].placeBomb();
         }
      });
      
      // collect powerups
      ALL_COLORS.forEach(color => {
         if (!sok.room[color] || sok.room[color].dead) {
            return;
         }
         sok.room[color].collectPowerup(Math.floor(sok.room[color].coords.x / BLOCK_SIZE), Math.floor(sok.room[color].coords.y / BLOCK_SIZE));
         sok.room[color].collectPowerup(Math.ceil(sok.room[color].coords.x / BLOCK_SIZE), Math.ceil(sok.room[color].coords.y / BLOCK_SIZE));
      });
      
      // update bombs' positions
      sok.room.bombs.forEach((bomb, bombId) => {
         if (bomb.xvel || bomb.yvel) {
            const oldCoords: Coord = { x: bomb.x, y: bomb.y };
            bomb.x += bomb.xvel * KICK_BOMB_SPEED;
            bomb.y += bomb.yvel * KICK_BOMB_SPEED;
            const newCoords: Coord = { x: bomb.x, y: bomb.y };
            
            let checkBlock: Coord = { x: 0, y: 0 };
            if (bomb.xvel) {
               oldCoords.y = Math.round(oldCoords.y);
               newCoords.y = Math.round(newCoords.y);
               
               checkBlock.y = oldCoords.y;
               if (bomb.xvel === 1) {
                  checkBlock.x = Math.floor(oldCoords.x) + 1;
               } else if (bomb.xvel === -1) {
                  checkBlock.x = Math.floor(oldCoords.x);
                  if (oldCoords.x === Math.floor(oldCoords.x)) {
                     checkBlock.x --;
                  }
               }
            } else if (bomb.yvel) {
               oldCoords.x = Math.round(oldCoords.x);
               newCoords.x = Math.round(newCoords.x);
               
               checkBlock.x = oldCoords.x;
               if (bomb.yvel === 1) {
                  checkBlock.y = Math.floor(oldCoords.y) + 1;
               } else if (bomb.yvel === -1) {
                  checkBlock.y = Math.floor(oldCoords.y);
                  if (oldCoords.y === Math.floor(oldCoords.y)) {
                     checkBlock.y --;
                  }
               }
            }
            
            // checking if the bomb can continue walking
            let canGo: boolean = true;
            if (0 <= checkBlock.x && checkBlock.x < BLOCKS_HORIZONTALLY && 0 <= checkBlock.y && checkBlock.y < BLOCKS_VERTICALLY) {
               if (sok.room.map[checkBlock.y][checkBlock.x] === Block.PERMANENT ||
                     sok.room.map[checkBlock.y][checkBlock.x] === Block.NORMAL) {
                  canGo = false;
               }
               
               const otherBombId: number | undefined = sok.room.getBombIdByCoords({ x: checkBlock.x, y: checkBlock.y });
               if (otherBombId && otherBombId !== bombId) {
                  canGo = false;
               }
               
               
               ALL_COLORS.forEach(color => {
                  if (!sok.room[color] || sok.room[color].dead) {
                     return;
                  }
                  
                  if (sok.room[color].coords.x / BLOCK_SIZE === checkBlock.x) {
                     if (Math.abs(sok.room[color].coords.y / BLOCK_SIZE - checkBlock.y) < 1) {
                        canGo = false;
                     }
                  } else if (sok.room[color].coords.y / BLOCK_SIZE === checkBlock.y) {
                     if (Math.abs(sok.room[color].coords.x / BLOCK_SIZE - checkBlock.x) < 1) {
                        canGo = false;
                     }
                  }
               });
            } else {
               canGo = false;
            }
            
            
            if (!canGo) {
               newCoords.x = Math.round(oldCoords.x);
               newCoords.y = Math.round(oldCoords.y);
               bomb.xvel = bomb.yvel = 0;
            } else {
               // does it destroy any powerup?
               if (isPowerup(sok.room.map[checkBlock.y][checkBlock.x])) {
                  sok.room.map[checkBlock.y][checkBlock.x] = Block.NO;
                  io.to(sok.room.name).emit('mapUpdates', [{ x: checkBlock.x, y: checkBlock.y, block: Block.NO }]);
               }
               
               // explode if it walks in flames
               let exploded = false;
               ALL_COLORS.forEach(color => {
                  if (sok.room[color] && sok.room.flames.get(Math.round(newCoords.x))?.get(Math.round(newCoords.y))?.get(sok.room[color])) {
                     sok.room.explodeBomb(bombId, false);
                     exploded = true;
                  }
               });
               if (exploded) {
                  return; // not a bomb anymore
               }
            }
            
            bomb.x = newCoords.x;
            bomb.y = newCoords.y;
            io.to(sok.room.name).emit('updateBomb', bombId, newCoords.x, newCoords.y);
         }
      });
      
      // prepare endscreen
      if (!sok.room.endscreen_tickId && sok.room.countPlayersAlive <= (sok.room.singlePlayer ? 0 : 1)) {
         const funcId: number | undefined = sok.room.ticks.addFunc(sok.room.showEndScreen, END_SCREEN_TIMEOUT / sok.room.ticks.MSPT);
         if (funcId) {
            sok.room.endscreen_tickId = funcId;
         }
      }
   };
}