import { addPlayer, players, setMyPlayer, userName } from "../game-variables";

export function processPacket_playerPlus(packet: Uint8Array) {
   let idx = 1;
   let newUserName = '';
   for (; idx < packet.length; ++idx) {
      newUserName += String.fromCharCode(packet[idx]);
   }

   addPlayer(newUserName);
   if (newUserName === userName) {
      const player = players.get(newUserName);
      if (player) {
         setMyPlayer(player);
      } else {
         console.error('?');
      }
   }
}