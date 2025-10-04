import { WebSocket } from "ws";
import { BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAP_FOURWAY_PORTAL_POSITIONS } from "../game-consts";
import { Block, Bomb, Color, RoomStatus } from "../game-types";
import { OutPackets } from "../out-packets/out-packets";

export function tie_bombs(sok: WebSocket): void {
   sok.placeBomb = (): void => {
      if (sok.color === null) {
         OutPackets.send_error(sok, 'tryPlaceBomb: You are a spectator.');
         return;
      }
      if (sok.dead) {
         OutPackets.send_error(sok, 'tryPlaceBomb: You are \'dead\'');
         return;
      }
      if (sok.room.status !== RoomStatus.RUNNING) {
         OutPackets.send_error(sok, 'tryPlaceBomb: The game is not running');
         return;
      }
      
      const x = Math.round(sok.coords.x / BLOCK_SIZE);
      const y = Math.round(sok.coords.y / BLOCK_SIZE);
      
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) ) {
         OutPackets.send_error(sok, 'tryPlaceBomb: x or y out of range.');
         return;
      }
      if (sok.room.grid[x][y] === Block.PERMANENT || sok.room.grid[x][y] === Block.NORMAL) {
         OutPackets.send_error(sok, 'tryPlaceBomb: can\'t place bomb here');
         return;
      }
      
      let exit: boolean = false;
      Object.values(Color).forEach(color => {
         if (sok.room[color] && sok.room.getFlame(x, y, sok.room[color])) {
            exit = true; // can't place a bomb inside flame
         }
      });
      if (exit) {
         return;
      }
      
      if (sok.room.getBomb(x, y)) {
         return; // can't place bomb inside bomb
      }
      
      if (sok.room.map === 'fourway') {
         if (MAP_FOURWAY_PORTAL_POSITIONS.filter(({x: xx, y: yy}) => (xx === x && yy === y)).length === 1) {
            return; // can't place bomb inside a portal
         }
      }
      
      let realBombCount = sok.bombCount;
      sok.room.bombs.forEach((bomb) => {
         if (bomb.owner === sok) {
            realBombCount -= 1;
         }
      });
      sok.room.flames.forEach(flame => {
         if (flame.owner === sok && flame.wasBomb) {
            realBombCount -= 1;
         }
      });
      
      if (realBombCount <= 0) {
         return; // no bombs left
      }

      
      // placing the bomb
      const bombId: number = sok.room.bombIdCounter;
      const tickFuncId: number | undefined = sok.room.ticks.addFunc(
         () => {
            sok.room.explodeBomb(bombId);
            OutPackets.send_playSound(sok.room, 'explode');
         },
         sok.bombTime / sok.room.ticks.MSPT
      );

      if (!tickFuncId) {
         return console.error('tryPlaceBomb: something went wrong');
      }
      sok.room.bombs.push({ x, y, id: bombId, xvel: 0, yvel: 0, xvel_push: 0, yvel_push: 0, owner: sok, length: sok.bombLength, tickFuncId });
      sok.room.bombIdCounter ++;
      
      OutPackets.send_addBomb(sok.room, x, y, bombId);
      if (sok.sick) {
         OutPackets.send_playSound(sok.room, 'dropbombsick');
      } else {
         OutPackets.send_playSound(sok.room, 'dropbomb');
      }
   };

   sok.kickBomb = (bombId: number, xvel: number, yvel: number): void => {
      const bomb: Bomb | undefined = sok.room.getBomb(bombId);
      if (!bomb) {
         return; // maybe the client still has the bomb data
      }
      if (!sok.kickBombs || sok.room.map === 'magneto') {
         return;
      }

      if (bomb.xvel === xvel && bomb.yvel === yvel) {
         return; // nothing changes
      }
      
      bomb.xvel_push = xvel;
      bomb.yvel_push = yvel;
   };
}