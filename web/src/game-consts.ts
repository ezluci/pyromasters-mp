import { Block, Color } from "./game-types";

export function isPowerup(block: Block): boolean {
   return block === Block.POWER_BOMBLENGTH ||
         block === Block.POWER_BOMBPLUS ||
         block === Block.POWER_BOMBTIME ||
         block === Block.POWER_BONUS ||
         block === Block.POWER_KICKBOMBS ||
         block === Block.POWER_SHIELD ||
         block === Block.POWER_SICK ||
         block === Block.POWER_SPEED ||
         block === Block.POWER_SWITCHPLAYER;
}

export const MOVE_SPEEDS = [0.17, 0.279, 0.337];
export const BOMB_TIMES = [4000, 3600, 3200, 2800];

export const OFFSET_LEFT = 10;
export const OFFSET_RIGHT = 10;
export const OFFSET_UP = 27;
export const OFFSET_DOWN = 10;

export const BLOCKS_HORIZONTALLY = 15;
export const BLOCKS_VERTICALLY = 11;
export const BLOCK_SIZE = 53;
export const BLOCK_SAFE_PX = 7;

export const FIRE_TIME = 400;
export const SICK_TIME_TICKS = 625;
export const SHIELD_TIME_TICKS = 625;
export const KICK_BOMB_SPEED = 0.06;

export const MIN_X = 0;
export const MIN_Y = 0;
export const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1);
export const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1);

export const DEFAULT_POS: {
   [C in Color]: { x: number, y: number }
} = {
   white: {x: MIN_X, y: MIN_Y},
   black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y},
   green: {x: MIN_X, y: MAX_Y}
};

export const END_SCREEN_TIMEOUT = 5000;

export const MAP_FOURWAY_PORTAL_POSITIONS: { x: number, y: number }[] = [
   { x: 2, y: 2 },
   { x: 2, y: BLOCKS_VERTICALLY - 3 },
   { x: BLOCKS_HORIZONTALLY - 3, y: BLOCKS_VERTICALLY - 3 },
   { x: BLOCKS_HORIZONTALLY - 3, y: 2 }
];

export const MAP_FOURWAY_NEXT_PORTAL: { x: number, y: number }[] = [
   { x: 2, y: BLOCKS_VERTICALLY - 3 },
   { x: BLOCKS_HORIZONTALLY - 3, y: BLOCKS_VERTICALLY - 3 },
   { x: BLOCKS_HORIZONTALLY - 3, y: 2 },
   { x: 2, y: 2 }
];