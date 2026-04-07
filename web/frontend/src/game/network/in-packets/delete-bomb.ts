import type { Game } from "../..";

export function processPacket_deleteBomb(packet: Uint8Array, g: Game) {
   
   const id = packet[1] << 8 | packet[2];
   const index = g.bombs.findIndex(bomb => bomb.id === id);
   if (index !== -1) {
      g.bombs.splice(index, 1);
   }
}