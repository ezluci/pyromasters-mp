import { Animation, Color, Coord } from "./game-types";
import { Room } from "./room";

declare module 'socket.io' {
   interface Socket {
      name: string;
      room: Room;
      isOwner: boolean;

      wins: number;
      kills: number;
      
      color: Color | null; // if color is null then spectator
      coords: Coord;
      dead: boolean;
      animState: Animation;

      speed: number; // check MOVE_SPEEDS
      _speed: number; // don't access variables with _  check attach-getters-setters.ts
      bombCount: number;
      bombTime: number; // check BOMB_TIMES
      _bombTime: number;
      bombLength: number;
      
      shield: boolean;
      _shield: boolean;
      shieldFalse_tickId: number;
      
      sick: boolean;
      _sick: boolean;
      sickFalse_tickId: number;

      kickBombs: boolean;

      // METHODS:

      isDying: () => boolean | Color[];
      placeBomb: () => void;
      kickBomb: (bombId: number, xvel: number, yvel: number) => void; // wrong declaration!
      collectPowerup: (x: number, y: number) => void;
   }
}