import { Socket } from "socket.io";
import { Room } from "../room";
import { RoomStatus } from "../game-types";
import { DEFAULT_POS } from "../game-consts";

export function disconnect(rooms: Map<string, Room>, sok: Socket): void {
   const io = sok.nsp.server;
   console.log(`disconnected: ${sok.id}, {username: ${sok.name}, room: ${sok.room.name}, isOwner: ${sok.isOwner}}`);

   sok.to(sok.room.name).emit('player-', sok.name);
   sok.room.players.delete(sok.name);

   if (sok.isOwner) {
      // destroy room
      io.to(sok.room.name).emit('chat', sok.name, 'Owner left. Room deleted.');
      
      sok.room.players.forEach(player => {
         player.disconnect();
      });
      if (sok.room.ticks.tickLoopIntervalId) {
         sok.room.ticks.endTickLoop();
      }
      rooms.delete(sok.room.name);
   } else {
      if (sok.color !== null) {
         if (sok.room.status !== RoomStatus.WAITING && sok.room.status !== RoomStatus.STARTING) {
            io.to(sok.room.name).emit('coords', sok.color, { x: 0, y: 0 });
            sok.room[sok.color] = null;
         } else {
            io.to(sok.room.name).emit('coords', sok.color, DEFAULT_POS[sok.color]);
            sok.room[sok.color] = null;
         }
      }
   }
}