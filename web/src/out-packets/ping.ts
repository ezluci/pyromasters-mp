import { server } from "../game-socket";

const packetChar = ';'.charCodeAt(0);

export function sendPacket_ping(time: number) {
   if ((window as any).testnoping)  return;
   
   const packet = new Uint8Array(1 + 3);
   
   packet[0] = packetChar;

   packet[1] = time >>> 16;
   packet[2] = time >>> 8;
   packet[3] = time;
   
   server.send(packet);
}