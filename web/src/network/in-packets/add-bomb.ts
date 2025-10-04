import type { Game } from "../../game";

export function processPacket_addBomb(packet: Uint8Array, g: Game) {
   
   const x = packet[1];
   const y = packet[2];
   const id = packet[3] << 8 | packet[4];
   g.bombs.push({ x, y, id });
}