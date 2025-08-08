import { server } from "../game-socket";

const packetChar = 'C'.charCodeAt(0);

export function sendPacket_chat(message: string) {
   const packet = new Uint8Array(1 + message.length);

   packet[0] = packetChar;

   for (let i = 0; i < message.length; ++i) {
      packet[1 + i] = message.charCodeAt(i);
   }
   
   server.send(packet);
}