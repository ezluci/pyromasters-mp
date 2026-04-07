import type { Game } from "../..";

export function processPacket_gameTime(packet: Uint8Array, g: Game) {
   
   const time = packet[1] << 8 | packet[2];

   g.gameTime = time;
}