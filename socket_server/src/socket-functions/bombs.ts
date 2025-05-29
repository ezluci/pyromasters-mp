import { Server, Socket } from "socket.io";
import { ALL_COLORS, BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAP_FOURWAY_PORTAL_POSITIONS } from "../game-consts";
import { Block, Bomb, RoomStatus } from "../game-types";
import { playSound } from "../room-functions/play-sound";

export function tie_bombs(sok: Socket): void {
   const io: Server = sok.nsp.server;

   sok.placeBomb = (): void => {
      if (sok.color === null) {
         sok.emit('error', 'tryPlaceBomb: You are a spectator.');
         return;
      }
      if (sok.dead) {
         sok.emit('error', 'tryPlaceBomb: You are \'dead\'');
         return;
      }
      if (sok.room.status !== RoomStatus.RUNNING) {
         sok.emit('error', 'tryPlaceBomb: The game is not running');
         return;
      }
      
      const x = Math.round(sok.coords.x / BLOCK_SIZE);
      const y = Math.round(sok.coords.y / BLOCK_SIZE);
      
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) ) {
         sok.emit('error', 'tryPlaceBomb: x or y out of range.');
         return;
      }
      if (sok.room.map[y][x] === Block.PERMANENT || sok.room.map[y][x] === Block.NORMAL) {
         sok.emit('error', 'tryPlaceBomb: can\'t place bomb here');
         return;
      }
      
      let exit: boolean = false;
      ALL_COLORS.forEach(color => {
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
      
      if (sok.room.mapName === 'fourway') {
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
            playSound(sok.room, 'explode');
         },
         sok.bombTime / sok.room.ticks.MSPT
      );

      if (!tickFuncId) {
         return console.error('tryPlaceBomb: something went wrong');
      }
      sok.room.bombs.push({ x, y, id: bombId, xvel: 0, yvel: 0, xvel_push: 0, yvel_push: 0, owner: sok, length: sok.bombLength, tickFuncId });
      sok.room.bombIdCounter ++;
      
      io.to(sok.room.name).emit('addBomb', bombId, x, y);
      if (sok.sick) {
         playSound(sok.room, 'dropbombsick');
      } else {
         playSound(sok.room, 'dropbomb');
      }
   };

   sok.kickBomb = (bombId: number, xvel: number, yvel: number): void => {
      const bomb: Bomb | undefined = sok.room.getBomb(bombId);
      if (!bomb) {
         return; // maybe the client still has the bomb data
      }
      if (!sok.kickBombs || sok.room.mapName === 'magneto') {
         return;
      }

      if (bomb.xvel === xvel && bomb.yvel === yvel) {
         return; // nothing changes
      }
      
      bomb.xvel_push = xvel;
      bomb.yvel_push = yvel;
   };
}