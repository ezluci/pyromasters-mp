import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "../game-consts";
import { Block } from "../game-types";
import { OutPackets } from "../out-packets/out-packets";
import { Room } from "../room";

export function generate_placeEndgameBlock(room: Room): () => void {
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
      
      const bomb = room.getBomb(xg, yg);
      if (bomb) {
         room.explodeBomb(bomb.id);
         OutPackets.send_playSound(room, 'explode');
      }

      filled[yg][xg] = true;
      room.grid[yg][xg] = Block.PERMANENT;

      OutPackets.send_gridUpdate(room, xg, yg, Block.PERMANENT);
      OutPackets.send_playSound(room, 'walldrop');

      [xg, yg] = [xn, yn];
   };
}