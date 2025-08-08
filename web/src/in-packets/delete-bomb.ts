import { bombs } from "../game-variables";

export function processPacket_deleteBomb(packet: Uint8Array) {
   
   const id = packet[1] << 8 | packet[2];
   const index = bombs.findIndex(bomb => bomb.id === id);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
}