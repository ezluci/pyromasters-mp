import type { Game } from "../..";

export function processPacket_playerPlus(packet: Uint8Array, g: Game) {
   let idx = 1;
   let newUserName = '';
   for (; idx < packet.length; ++idx) {
      newUserName += String.fromCharCode(packet[idx]);
   }

   g.addPlayer(newUserName);
   if (newUserName === g.userName) {
      const player = g.players.get(newUserName);
      if (player) {
         g.myPlayer = player;
      } else {
         console.error('?');
      }
   }
}