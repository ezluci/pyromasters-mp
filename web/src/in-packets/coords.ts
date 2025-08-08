import { Color } from "../game-types";
import { colors } from "../game-variables";

export function processPacket_coords(packet: Uint8Array) {
   const color = Object.values(Color)[packet[1]];
   const x = (packet[2] << 16 | packet[3] << 8 | packet[4]) * 1e-4;
   const y = (packet[5] << 16 | packet[6] << 8 | packet[7]) * 1e-4;

   if (!colors[color]) {
      return console.error('processPacket_coords: player is null');
   }

   colors[color].coords.x = x;
   colors[color].coords.y = y;
}