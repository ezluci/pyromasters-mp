import { Dom } from "../../dom";
import type { Game } from "../../game";

export function processPacket_error(packet: Uint8Array, g: Game) {
   let idx = 1;

   let message = '';
   for (; packet[idx]; ++idx) {
      message += String.fromCharCode(packet[idx]);
   }


   Dom.addLog(`ERROR: ${message}`);
   console.error(`ERROR: ${message}`);
}