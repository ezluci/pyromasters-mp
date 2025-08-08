import { WebSocket } from "ws";
import { Block, Bomb, Color } from "./game-types";
import { OutPackets, Packet } from "./out-packets/out-packets";
import { BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, END_SCREEN_TIMEOUT, isPowerup, KICK_BOMB_SPEED, MAP_FOURWAY_PORTAL_POSITIONS } from "./game-consts";

// this GENERATES the runEveryTick function that is going to be passed into the Ticks class
export function generate_runEveryTick(sok: WebSocket): () => void {
   return () => {
      // send coordinates to everyone
      OutPackets.send_C(sok.room);
      
      // check deaths
      Object.values(Color).forEach(color => {
         if (!sok.room[color] || sok.room[color].dead) {
            return;
         }
         
         const deathStatus: boolean | Color[] = sok.room[color].isDying();
         if (typeof deathStatus === 'boolean') { // didn't die
            return;
         }
         
         sok.room.countPlayersAlive --;
         OutPackets.send_death(sok.room, color);
         OutPackets.send_playSound(sok.room, 'dead');

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
      Object.values(Color).forEach(color => {
         if (sok.room[color] && !sok.room[color].dead && sok.room[color].sick) {
            sok.room[color].placeBomb();
         }
      });
      
      // collect powerups
      Object.values(Color).forEach(color => {
         if (!sok.room[color] || sok.room[color].dead) {
            return;
         }
         sok.room[color].collectPowerup(Math.floor(sok.room[color].coords.x / BLOCK_SIZE), Math.floor(sok.room[color].coords.y / BLOCK_SIZE));
         sok.room[color].collectPowerup(Math.ceil(sok.room[color].coords.x / BLOCK_SIZE), Math.ceil(sok.room[color].coords.y / BLOCK_SIZE));
      });
      
      // update bombs' positions
      sok.room.bombs.forEach((bomb) => {
         let pushed = false;
         if (bomb.xvel_push || bomb.yvel_push) {
            bomb.xvel = bomb.xvel_push;
            bomb.yvel = bomb.yvel_push;
            bomb.xvel_push = 0;
            bomb.yvel_push = 0;
            pushed = true;
         }

         if (bomb.xvel || bomb.yvel) {
            const oldCoords = { x: bomb.x, y: bomb.y };
            bomb.x += bomb.xvel * KICK_BOMB_SPEED;
            bomb.y += bomb.yvel * KICK_BOMB_SPEED;
            const newCoords = { x: bomb.x, y: bomb.y };
            
            let checkBlock = { x: 0, y: 0 };
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
               if (sok.room.grid[checkBlock.y][checkBlock.x] === Block.PERMANENT ||
                     sok.room.grid[checkBlock.y][checkBlock.x] === Block.NORMAL) {
                  canGo = false;
               }

               if (sok.room.map === 'fourway') {
                  MAP_FOURWAY_PORTAL_POSITIONS.forEach((portalCoord) => {
                     if (portalCoord.x === checkBlock.x && portalCoord.y === checkBlock.y) {
                        canGo = false;
                     }
                  });
               }
               
               const otherBomb: Bomb | undefined = sok.room.getBomb(checkBlock.x, checkBlock.y);
               if (otherBomb && otherBomb.id !== bomb.id) {
                  canGo = false;
               }
               
               
               Object.values(Color).forEach(color => {
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
               if (pushed) {
                  OutPackets.send_playSound(sok.room, 'kickbomb');
               }
               // does it destroy any powerup?
               if (isPowerup(sok.room.grid[checkBlock.y][checkBlock.x])) {
                  sok.room.grid[checkBlock.y][checkBlock.x] = Block.NO;
                  OutPackets.send_gridUpdate(sok.room, checkBlock.x, checkBlock.y, Block.NO);
               }
               
               // explode if it walks in flames
               let exploded = false;
               Object.values(Color).forEach(color => {
                  if (!exploded && sok.room[color] && sok.room.getFlame(Math.round(newCoords.x), Math.round(newCoords.y), sok.room[color])) {
                     sok.room.explodeBomb(bomb.id);
                     exploded = true;
                  }
               });
               if (exploded) {
                  return; // not a bomb anymore
               }
            }
            
            bomb.x = newCoords.x;
            bomb.y = newCoords.y;
            OutPackets.send_updateBomb(sok.room, newCoords.x, newCoords.y, bomb.id);
         }
      });
      
      // prepare endscreen
      if (!sok.room.endscreen_tickId && sok.room.countPlayersAlive <= (sok.room.singlePlayer ? 0 : 1)) {
         const funcId: number | undefined = sok.room.ticks.addFunc(sok.room.showEndScreen, END_SCREEN_TIMEOUT / sok.room.ticks.MSPT);
         if (funcId) {
            sok.room.endscreen_tickId = funcId;
         }
      }

      // send buffered packets (at the end of tick loop)
      const roomBuffer = OutPackets.getBufferedPackets(sok.room);
      OutPackets.setBufferedPackets(sok.room, []);
      sok.room.players.forEach(player => {
         const playerNewBuffer: Packet[] = [];
         const playerBuffer = OutPackets.getBufferedPackets(player);
         let i = 0, j = 0;
         
         while (i < roomBuffer.length && j < playerBuffer.length) {
            if (roomBuffer[i].time < playerBuffer[j].time) {
               playerNewBuffer.push(roomBuffer[i++]);
            } else {
               playerNewBuffer.push(playerBuffer[j++]);
            }
         }

         while (i < roomBuffer.length) {
            playerNewBuffer.push(roomBuffer[i++]);
         }

         while (j < playerBuffer.length) {
            playerNewBuffer.push(playerBuffer[j++]);
         }

         const frame = OutPackets.constructFrame(playerNewBuffer);
         if (!frame) {
            return console.error('generate_runEveryTick: constructFrame returned undefined');
         }

         OutPackets.sendFrame(player, frame);
         OutPackets.setBufferedPackets(player, []);
      });
   };
}