import { server } from "../game-socket";
import { Bomb } from "../game-types";

const packetChar = 'K'.charCodeAt(0);

export function sendPacket_kickBomb(bomb: Bomb, xvel: number, yvel: number) {
   const packet = new Uint8Array(1 + 2);
   
   if (xvel === -1) {
      xvel = 0b10;
   }
   if (yvel === -1) {
      yvel = 0b10;
   }

   packet[0] = packetChar;

   const value = bomb.id << 2+2 | xvel << 2 | yvel;
   packet[1] = value >>> 8 & 0xff;
   packet[2] = value & 0xff;
   
   server.send(packet);
}