import type { Game } from "../..";

export function processPacket_playerMinus(packet: Uint8Array, g: Game) {
   let idx = 1;
   let userName = '';
   for (; idx < packet.length; ++idx) {
      userName += String.fromCharCode(packet[idx]);
   }

   g.removePlayer(userName);
}