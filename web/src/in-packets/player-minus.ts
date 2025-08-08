import { removePlayer } from "../game-variables";

export function processPacket_playerMinus(packet: Uint8Array) {
   let idx = 1;
   let userName = '';
   for (; idx < packet.length; ++idx) {
      userName += String.fromCharCode(packet[idx]);
   }

   removePlayer(userName);
}