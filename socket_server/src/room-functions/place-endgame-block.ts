import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "../game-consts";
import { Block } from "../game-types";
import { Room } from "../room";

export function generate_placeEndgameBlock(room: Room): () => void {
   const io = room.owner.nsp.server;
   let xg: number, yg: number, xdir: number, ydir: number;
   let filled: boolean[][] = [];

   return () => {
      if (room.endscreen_tickId) { // the game is finished
         return;
      }

      if (room.endgameBlocks === 0) { // initialize variables
         xg = 0;
         yg = 0;
         xdir = 1;
         ydir = 0;
         for (let i = 0; i < BLOCKS_VERTICALLY; ++i) {
            filled[i] = [];
            for (let j = 0; j < BLOCKS_HORIZONTALLY; ++j) {
               filled[i][j] = false;
            }
         }
      }

      if (room.endgameBlocks === BLOCKS_HORIZONTALLY * BLOCKS_VERTICALLY) {
         console.error('endgameblocks already full');
         return;
      }

      room.endgameBlocks ++;
      let xn = xg + xdir;
      let yn = yg + ydir;

      if ( !(0 <= xn && xn < BLOCKS_HORIZONTALLY && 0 <= yn && yn < BLOCKS_VERTICALLY && !filled[yn][xn]) ) {
         [xdir, ydir] = [ydir, xdir];
         if (xdir) {
            xdir *= -1;
         }
         
         xn = xg + xdir;
         yn = yg + ydir;
      }
      
      const bombId = room.getBombIdByCoords({x: xg, y: yg});
      if (bombId) {
         room.explodeBomb(bombId, false);
      }

      filled[yg][xg] = true;
      room.map[yg][xg] = Block.PERMANENT;

      io.to(room.name).emit('mapUpdates', [{x: xg, y: yg, block: Block.PERMANENT}]);
      io.to(room.name).emit('playsound', 'walldrop');

      [xg, yg] = [xn, yn];
   };
}