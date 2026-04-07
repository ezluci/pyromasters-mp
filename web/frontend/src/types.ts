export interface Bomb {
   x: number;
   y: number;
   id: number;
}

export interface Flame {
   x: number;
   y: number;
   id: number;
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

export class Player {
   name: string;
   isOwner: boolean;

   wins: number;
   kills: number;

   color: Color | null;
   x: number;
   y: number;
   dead: boolean;
   animState: Animation;
   
   speed: number;
   bombCount: number;
   bombTime: number;
   bombLength: number;
   switchedKeys: number;
   shield: boolean;
   sick: boolean;
   kickBombs: boolean;

   constructor(name: string) {
      this.name = name;
      this.isOwner = false;
      
      this.wins = 0;
      this.kills = 0;

      this.color = null;
      this.x = 0;
      this.y = 0;
      this.dead = false;

      this.animState = Animation.IDLE_BACK;
      this.speed = 0;
      this.bombCount = 0;
      this.bombTime = 0;
      this.bombLength = 0;
      this.switchedKeys = 0;
      this.shield = false;
      this.sick = false;
      this.kickBombs = false;
   }
}