import { Color } from "../../types";
import { Game } from "../../game";

export function processPacket_coords(packet: Uint8Array, g: Game) {
   const color = Object.values(Color)[packet[1]];
   const x = (packet[2] << 16 | packet[3] << 8 | packet[4]) * 1e-4;
   const y = (packet[5] << 16 | packet[6] << 8 | packet[7]) * 1e-4;

   if (!g.colors[color]) {
      return console.error('processPacket_coords: player is null');
   }

   g.colors[color].x = x;
   g.colors[color].y = y;
}