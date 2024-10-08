'use strict';

const OFFSET_LEFT = 10
const OFFSET_RIGHT = 10
const OFFSET_UP = 27
const OFFSET_DOWN = 10

const BLOCKS_HORIZONTALLY = 15
const BLOCKS_VERTICALLY = 11
const BLOCK_SIZE = 53
const BLOCK_SAFE_PX = 7

const MOVE_SPEEDS = [0.17, 0.279, 0.337]
const FIRE_TIME = 400
const SICK_TIME_TICKS = 625
const SHIELD_TIME_TICKS = 625
const KICK_BOMB_SPEED = 0.06;
const BOMB_TIMES = [4000, 3600, 3200, 2800]

const MIN_X = 0
const MIN_Y = 0
const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1)
const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1)

const BLOCK = {
   NO: 0,   // nothing
   NORMAL: 1,  // a block that can be destroyed with bombs
   PERMANENT: 2,   // a block that cannot be destroyed
   //BOMB: 3, // a bomb
   //FIRE: 4, // fire from bomb
   POWER_BOMBPLUS: 5,
   POWER_BOMBLENGTH: 6,
   POWER_SPEED: 7,
   POWER_SHIELD: 8,
   POWER_KICKBOMBS: 9,
   POWER_BOMBTIME: 10,
   POWER_SWITCHPLAYER: 11,
   POWER_SICK: 12,
   POWER_BONUS: 13,
   PORTAL: 14, // for 'fourway' map
}

const INEXISTENT_POS = {x: -100, y: -100}
const DEFAULT_POS = {
   white: {x: MIN_X, y: MIN_Y}, black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y}, green: {x: MIN_X, y: MAX_Y},
   spectator: INEXISTENT_POS
}

const ROOM_STATUS = {
   WAITING: 'waiting',
   STARTING: 'starting',
   RUNNING: 'running'
}

const END_SCREEN_TIMEOUT = 5000;

const ANIMATION = {
   IDLE: 0,
   FRONT: 1,
   BACK: 2,
   LEFT: 3,
   RIGHT: 4
}

const MAP_FOURWAY_PORTAL_POSITIONS = [
   {x: 2, y: 2},
   {x: 2, y: BLOCKS_VERTICALLY - 3},
   {x: BLOCKS_HORIZONTALLY - 3, y: BLOCKS_VERTICALLY - 3},
   {x: BLOCKS_HORIZONTALLY - 3, y: 2}
];

const MAP_FOURWAY_NEXT_PORTAL = [
   {x: 2, y: BLOCKS_VERTICALLY - 3},
   {x: BLOCKS_HORIZONTALLY - 3, y: BLOCKS_VERTICALLY - 3},
   {x: BLOCKS_HORIZONTALLY - 3, y: 2},
   {x: 2, y: 2}
]

try { // only for the nodejs server
   module.exports = {
      OFFSET_LEFT, OFFSET_RIGHT, OFFSET_UP, OFFSET_DOWN,
      BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BLOCK_SIZE, BLOCK_SAFE_PX, MOVE_SPEEDS, FIRE_TIME, SICK_TIME_TICKS, BOMB_TIMES, SHIELD_TIME_TICKS,
      MIN_X, MIN_Y, MAX_X, MAX_Y,
      BLOCK, KICK_BOMB_SPEED,
      INEXISTENT_POS, DEFAULT_POS,
      ROOM_STATUS, END_SCREEN_TIMEOUT, ANIMATION, MAP_FOURWAY_PORTAL_POSITIONS, MAP_FOURWAY_NEXT_PORTAL
   }
} catch (e) {}