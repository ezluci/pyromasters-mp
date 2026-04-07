import { Map } from "../../types";
import type { Game } from "../..";

export function processPacket_map(packet: Uint8Array, g: Game) {
   let map = '';
   for (let i = 1; i < packet.length; ++i) {
      if (packet[i] == 0) {
         break;
      }
      map += String.fromCharCode(packet[i]);
   }

   if (!Object.values(Map).includes(map as Map)) {
      return console.error('processPacket_map: wrong map received');
   }

   g.map = map as Map;
}