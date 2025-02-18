import { Socket } from "socket.io";
import { Color, RoomStatus } from "../game-types";

export function selectColor(newColor: Color | null, sok: Socket): void {
   const io = sok.nsp.server;
   
   if (sok.room.status !== RoomStatus.WAITING) {
      sok.emit('error', 'selectColor: Room is not in WAITING status.');
      return
   }
   
   if (newColor !== null && !Object.values(Color).includes(newColor)) {
      sok.emit('error', 'selectColor: invalid color.');
      return;
   }
   
   if (newColor !== null && sok.room[newColor] !== null) {
      sok.emit('error', 'selectColor: color already taken.');
      return;
   }
   
   if (sok.color !== null) {
      sok.room[sok.color] = null;
   }
   
   sok.color = newColor;
   if (newColor !== null) {
      sok.room[newColor] = sok;
   }

   io.to(sok.room.name).emit('player~', sok.name, sok.name, sok.color, sok.isOwner);
}