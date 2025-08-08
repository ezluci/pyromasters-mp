import { Map } from "../game-types";
import { setMap } from "../game-variables";

export function processPacket_map(packet: Uint8Array) {
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

   setMap(map as Map);
}