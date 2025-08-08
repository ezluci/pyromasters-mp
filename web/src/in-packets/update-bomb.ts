import { bombs } from "../game-variables";

export function processPacket_updateBomb(packet: Uint8Array) {
   
   const x = (packet[1] << 16 | packet[2] << 8 | packet[3]) * 1e-4;
   const y = (packet[4] << 16 | packet[5] << 8 | packet[6]) * 1e-4;
   const id = packet[7] << 8 | packet[8];
   
   const index = bombs.findIndex(bomb => bomb.id === id);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
   bombs.push({ x, y, id: id });
}