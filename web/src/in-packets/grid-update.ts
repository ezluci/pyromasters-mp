import { Block } from "../game-types";
import { grid } from "../game-variables";

export function processPacket_gridUpdate(packet: Uint8Array) {
   const x: number = packet[1];
   const y: number = packet[2];
   const block: Block = packet[3];

   grid[y][x] = block;
}