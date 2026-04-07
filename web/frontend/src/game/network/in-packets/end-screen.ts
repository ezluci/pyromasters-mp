import { Dom } from "../../dom";
import type { Game } from "../..";
import { Color } from "../../types";

export function processPacket_endScreen(packet: Uint8Array, g: Game) {
   const color: Color | null = (packet[1] === 0 ? null : Object.values(Color)[packet[1] - 1]);

   if (!color) {
      Dom.addLog('Draw! Press \'Start game\' to play again.');
   } else {
      Dom.addLog(
         (color === Color.WHITE ? 'White' : color === Color.BLACK ? 'Black' : color === Color.ORANGE ? 'Orange' : 'Green')
         + ' won! Press \'Start game\' to play again.'
      );
   }

   if (color === null) {
      g.endScreen = 'draw';
   } else {
      g.endScreen = color;
   }
}