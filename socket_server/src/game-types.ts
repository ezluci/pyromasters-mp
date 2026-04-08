import { WebSocket } from "ws";

export interface Bomb {
  x: number;
  y: number;
  id: number;
  xvel: number;
  yvel: number;
  xvel_push: number;
  yvel_push: number;
  owner: WebSocket;
  length: number;
  tickFuncId: number;
}

export interface Flame {
  x: number;
  y: number;
  owner: WebSocket;
  oldBlock: Block;
  wasBomb: boolean;
  tickFuncId: number | undefined;
}

export enum Block {
  NO,      // nothing
  NORMAL,  // a block that can be destroyed with bombs
  PERMANENT,  // a block that cannot be destroyed
  POWER_BOMBPLUS,
  POWER_BOMBLENGTH,
  POWER_SPEED,
  POWER_SHIELD,
  POWER_KICKBOMBS,
  POWER_BOMBTIME,
  POWER_SWITCHPLAYER,
  POWER_SICK,
  POWER_BONUS
}

export enum Color {
  WHITE = 'white',
  BLACK = 'black',
  ORANGE = 'orange',
  GREEN = 'green'
}

export enum Animation {
  IDLE_BACK,
  IDLE_FRONT,
  IDLE_LEFT,
  IDLE_RIGHT,
  
  WALK_BACK,
  WALK_FRONT,
  WALK_LEFT,
  WALK_RIGHT
}

export enum RoomStatus {
  WAITING,
  STARTING,
  RUNNING
}

export enum Map {
  TESTMAP = 'testmap:)',
  RANDOM = 'random',
  BRICKTOWN = 'bricktown',
  FOURWAY = 'fourway',
  MAGNETO = 'magneto'
}