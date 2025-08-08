import { DOM_addChatMessage } from "../page";

export function processPacket_chat(packet: Uint8Array) {
   let idx = 1;

   let userName = '';
   for (; packet[idx]; ++idx) {
      userName += String.fromCharCode(packet[idx]);
   }

   let message = '';
   for (idx++; idx < packet.length; ++idx) {
      message += String.fromCharCode(packet[idx]);
   }

   DOM_addChatMessage(userName, message);
}