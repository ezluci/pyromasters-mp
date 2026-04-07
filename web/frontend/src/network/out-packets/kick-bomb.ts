import type { Game } from "../../game";
import { Bomb } from "../../types";

const packetChar = 'K'.charCodeAt(0);

export function sendPacket_kickBomb(g: Game, bomb: Bomb, xvel: number, yvel: number) {
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
   
   g.network.server.send(packet);
}