import { flames } from "../game-variables";

export function processPacket_addFlame(packet: Uint8Array) {
   const x = packet[1];
   const y = packet[2];
   flames[y][x]++;
}