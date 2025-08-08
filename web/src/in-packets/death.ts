import { Color } from "../game-types";
import { colors } from "../game-variables";
import { powerupsDOM } from "../page";

export function processPacket_death(packet: Uint8Array) {
   const color: Color = Object.values(Color)[packet[1]];
   
   if (colors[color]) {
      colors[color].dead = true;
      powerupsDOM[color].main.style.display = 'none';
   }
}