import { Animation, Color } from "./game-types";
import { Room } from "./room";

declare module 'ws' {
   interface WebSocket {
      name: string;
      room: Room;
      isOwner: boolean;
      lastReceivedPing: number;

      wins: number;
      kills: number;
      
      color: Color | null; // if color is null then spectator
      x: number;
      y: number;
      dead: boolean;
      animState: Animation;

      speed: number; // check MOVE_SPEEDS
      bombCount: number;
      bombTime: number; // check BOMB_TIMES
      bombLength: number;
      
      shield: boolean; // use setShield to set this!!
      setShield(value: boolean): void;
      shieldFalse_tickId: number;
      
      sick: boolean; // use setSick to set this!!
      setSick(value: boolean): void;
      sickFalse_tickId: number;

      kickBombs: boolean;

      // METHODS:

      isDying: () => false | Color[];
      placeBomb: () => void;
      kickBomb: (bombId: number, xvel: number, yvel: number) => void; // wrong declaration!
      collectPowerup: (x: number, y: number) => void;
      kill: (assists: Color[]) => void;
   }
}