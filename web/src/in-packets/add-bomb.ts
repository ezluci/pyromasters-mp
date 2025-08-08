import { bombs } from "../game-variables";

export function processPacket_addBomb(packet: Uint8Array) {
   
   const x = packet[1];
   const y = packet[2];
   const id = packet[3] << 8 | packet[4];
   bombs.push({ x, y, id });
}