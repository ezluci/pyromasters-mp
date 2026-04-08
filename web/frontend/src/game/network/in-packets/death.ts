import { Dom } from "../../dom";
import { Game } from "../../game";
import { Color } from "../../types";

export function processPacket_death(packet: Uint8Array, g: Game) {
   const color: Color = Object.values(Color)[packet[1]];
   
   if (g.colors[color]) {
      g.colors[color].dead = true;
      Dom.powerups[color].main.style.display = 'none';
   }
}