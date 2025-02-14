import { Server, Socket } from "socket.io";
import { ALL_COLORS, BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BOMB_TIMES, MAP_FOURWAY_PORTAL_POSITIONS } from "../game-consts";
import { Block, Bomb, RoomStatus } from "../game-types";

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
      
      for (const color of ALL_COLORS) {
         if (sok.room[color] && sok.room.flames.get(x)?.get(y)?.get(sok.room[color])) {
            return; // can't place a bomb inside flame
         }
      }
      
      if (sok.room.map[y][x] === Block.PERMANENT || sok.room.map[y][x] === Block.NORMAL)
         return;
      
      if (sok.room.getBombIdByCoords({ x, y })) {
         return;
      }
      
      if (sok.room.mapName === 'fourway') {
         if (MAP_FOURWAY_PORTAL_POSITIONS.filter(({x: xx, y: yy}) => (xx === x && yy === y)).length === 1) {
            return; // can't place bomb inside a portal
         }
      }
      
      if (sok.bombCount === 0)
         return; // no bombs left
      
      // placing the bomb
      const bombId: number = sok.room.bombIdCounter;
      const tickFuncId: number | undefined = sok.room.ticks.addFunc(
         () => sok.room.explodeBomb(bombId, false),
         sok.bombTime / sok.room.ticks.MSPT
      );

      if (!tickFuncId) {
         return console.error('tryPlaceBomb: something went wrong');
      }
      sok.room.bombs.set(bombId, { x, y, xvel: 0, yvel: 0, owner: sok, length: sok.bombLength, tickFuncId });
      sok.room.bombIdCounter ++;
      
      io.to(sok.room.name).emit('addBomb', bombId, x, y);
      if (sok.sick) {
         io.to(sok.room.name).emit('playsound', 'dropBombSick');
      }
      
      sok.bombCount --;
   };

   sok.kickBomb = (bombId: number, xvel: number, yvel: number): void => {
      const bomb: Bomb | undefined = sok.room.bombs.get(bombId);
      if (!bomb) {
         return console.error(`kickbomb bombid not good ${bombId}`);
      }
      if (!sok.kickBombs || sok.room.mapName === 'magneto') {
         return;
      }
      
      bomb.xvel = xvel;
      bomb.yvel = yvel;
   };
}