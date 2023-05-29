const OFFSET_LEFT = 10
const OFFSET_RIGHT = 10
const OFFSET_UP = 27
const OFFSET_DOWN = 10

const BLOCKS_HORIZONTALLY = 15
const BLOCKS_VERTICALLY = 11
const BLOCK_SIZE = 53
const MOVE_SPEED = 0.25 // default 0.15 maybe?
const BLOCK_SAFE_PX = 7

const MIN_X = 0
const MIN_Y = 0
const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1)
const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1)

const BLOCK = {
   NO: 0,   // nothing
   NORMAL: 1,  // a block that can be destroyed with bombs
   FIXED: 2,   // a block that cannot be destroyed
   BOMB: 3, // a bomb
   FIRE: 4, // fire from bomb
   POWER_BOMBPLUS: 5,
   POWER_BOMBLENGTH: 6,
   POWER_SPEED: 7,
   POWER_SHIELD: 8,
   POWER_KICKBOMBS: 9,
   POWER_BOMBTIME: 10,
   POWER_SWITCHPLAYER: 11,
   POWER_ILLNESS: 12,
   POWER_BONUS: 13
}

const INEXISTENT_POS = {x: -100, y: -100}
const DEFAULT_POS = {
   white: {x: MIN_X, y: MIN_Y}, black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y}, green: {x: MIN_X, y: MAX_Y},
   spectator: INEXISTENT_POS
}