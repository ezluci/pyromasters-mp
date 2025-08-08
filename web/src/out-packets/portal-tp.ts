import { server } from "../game-socket";

const packetChar = 'P'.charCodeAt(0);

export function sendPacket_portalTp() {
   const packet = new Uint8Array(1);

   packet[0] = packetChar;
   
   server.send(packet);
}