import { Block } from "../../types";
import { Game } from "../../game";

export function processPacket_gridUpdate(packet: Uint8Array, g: Game) {
   const x: number = packet[1];
   const y: number = packet[2];
   const block: Block = packet[3];

   g.grid[x][y] = block;
}