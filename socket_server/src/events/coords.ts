import { Socket } from "socket.io";
import { Coord, Animation } from "../game-types";

export function coords(coords: Coord, animState: Animation, sok: Socket): void {
   if (sok.color === null) {
      sok.emit('error', 'coords: You are a spectator.');
      return;
   }
   if (sok.dead) {
      sok.emit('error', 'coords: Player is \'dead\'');
      return;
   }
   if (!Object.values(Animation).includes(animState)) {
      sok.emit('error', 'coords: Invalid animation state.');
      return;
   }
   
   coords.x = Math.floor(coords.x);
   coords.y = Math.floor(coords.y);
   sok.coords = coords;
   sok.animState = animState;
}