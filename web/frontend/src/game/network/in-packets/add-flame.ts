import type { Game } from "../..";

export function processPacket_addFlame(packet: Uint8Array, g: Game) {
   const x = packet[1];
   const y = packet[2];
   g.flames[x][y]++;
}