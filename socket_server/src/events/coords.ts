import { Socket } from "socket.io";
import { Coord, Animation } from "../game-types";

export function coords(x: number, y: number, animState: Animation, sok: Socket): void {
   if (sok.color === null) {
      sok.emit('error', 'coords: You are a spectator.');
      return;
   }
   if (sok.dead) {
      // sok.emit('error', 'coords: Player is \'dead\'');
      return;
   }
   if (!Object.values(Animation).includes(animState)) {
      sok.emit('error', 'coords: Invalid animation state.');
      return;
   }
   
   sok.coords = { x: Math.floor(x), y: Math.floor(y) };
   sok.animState = animState;
}