import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from '../game-consts';
import { Block } from '../game-types';
import { logger } from '../log';
import { OutPackets } from '../out-packets/out-packets';
import { Room } from '../room';

export function generate_placeEndgameBlock(room: Room): () => void {
  let xg: number, yg: number, xdir: number, ydir: number;
  let filled: boolean[][];

  return () => {
    if (room.endscreen_tickId) {
      // the game is finished
      return;
    }

    if (room.endgameBlocks === 0) {
      // initialize variables
      xg = 0;
      yg = 0;
      xdir = 1;
      ydir = 0;
      filled = Array.from({ length: BLOCKS_HORIZONTALLY }, () =>
        Array(BLOCKS_VERTICALLY).fill(false),
      );
    }

    if (room.endgameBlocks === BLOCKS_HORIZONTALLY * BLOCKS_VERTICALLY) {
      logger.error('endgameblocks already full');
      return;
    }

    room.endgameBlocks++;
    let xn = xg + xdir;
    let yn = yg + ydir;

    if (
      !(
        0 <= xn &&
        xn < BLOCKS_HORIZONTALLY &&
        0 <= yn &&
        yn < BLOCKS_VERTICALLY &&
        !filled[xn][yn]
      )
    ) {
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

    filled[xg][yg] = true;
    room.grid[xg][yg] = Block.PERMANENT;

    OutPackets.send_gridUpdate(room, xg, yg, Block.PERMANENT);
    OutPackets.send_playSound(room, 'walldrop');

    [xg, yg] = [xn, yn];
  };
}
