import { Socket } from "socket.io";

export interface Bomb {
   x: number;
   y: number;
   xvel: number;
   yvel: number;
   owner: Socket;
   length: number;
   tickFuncId: number;
}

export interface Flame {
   x: number;
   y: number;
   owner: Socket;
   oldBlock: Block;
   wasBomb: boolean;
   tickFuncId: number | undefined;
}

export enum Block {
   NO = 0,   // nothing
   NORMAL = 1,  // a block that can be destroyed with bombs
   PERMANENT = 2,   // a block that cannot be destroyed
   POWER_BOMBPLUS = 5,
   POWER_BOMBLENGTH = 6,
   POWER_SPEED = 7,
   POWER_SHIELD = 8,
   POWER_KICKBOMBS = 9,
   POWER_BOMBTIME = 10,
   POWER_SWITCHPLAYER = 11,
   POWER_SICK = 12,
   POWER_BONUS = 13
}

export enum Color {
   WHITE = 'white',
   BLACK = 'black',
   ORANGE = 'orange',
   GREEN = 'green'
}

export interface Coord {
   x: number;
   y: number;
}

export enum Animation {
   IDLE_BACK = 'idle_back',
   IDLE_FRONT = 'idle_front',
   IDLE_LEFT = 'idle_left',
   IDLE_RIGHT = 'idle_right',
   
   WALK_BACK = 'walk_back',
   WALK_FRONT = 'walk_front',
   WALK_LEFT = 'walk_left',
   WALK_RIGHT = 'walk_right'
}

export enum RoomStatus {
   WAITING = 'waiting',
   STARTING = 'starting',
   RUNNING = 'running'
}