import { server } from "../game-socket";
import { Animation } from "../game-types";

const packetChar = 'S'.charCodeAt(0);

export function sendPacket_coords(x: number, y: number, animation: Animation) {
   const packet = new Uint8Array(1 + 7);

   packet[0] = packetChar;

   x *= 1e4;
   y *= 1e4;

   packet[1] = x >>> 16 & 0xff;
   packet[2] = x >>> 8 & 0xff;
   packet[3] = x & 0xff;

   packet[4] = y >>> 16 & 0xff;
   packet[5] = y >>> 8 & 0xff;
   packet[6] = y & 0xff;

   packet[7] = animation;
   
   server.send(packet);
}