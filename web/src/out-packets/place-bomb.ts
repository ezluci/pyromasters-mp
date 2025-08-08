import { server } from "../game-socket";

const packetChar = 'B'.charCodeAt(0);

export function sendPacket_placeBomb() {
   const packet = new Uint8Array(1);

   packet[0] = packetChar;
   
   server.send(packet);
}