import { Color } from "../game-types";
import { setEndScreen } from "../game-variables";
import { DOM_addLog } from "../page";

export function processPacket_endScreen(packet: Uint8Array) {
   const color: Color | null = (packet[1] === 0 ? null : Object.values(Color)[packet[1] - 1]);

   if (!color) {
      DOM_addLog('Draw! Press \'Start game\' to play again.');
   } else {
      DOM_addLog(
         (color === Color.WHITE ? 'White' : color === Color.BLACK ? 'Black' : color === Color.ORANGE ? 'Orange' : 'Green')
         + ' won! Press \'Start game\' to play again.'
      );
   }

   if (color === null) {
      setEndScreen('draw');
   } else {
      setEndScreen(color);
   }
}