import { DOM_addLog } from "../page";

export function processPacket_error(packet: Uint8Array) {
   let idx = 1;

   let message = '';
   for (; packet[idx]; ++idx) {
      message += String.fromCharCode(packet[idx]);
   }


   DOM_addLog(`ERROR: ${message}`);
   console.error(`ERROR: ${message}`);
}