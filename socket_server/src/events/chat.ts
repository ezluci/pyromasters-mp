import { Socket } from 'socket.io';

export function chat(msg: string, sok: Socket): void {
   const io = sok.nsp.server;
   if (msg === '') {
      return;
   }

   io.to(sok.room.name).emit('chat', sok.name, msg);
}