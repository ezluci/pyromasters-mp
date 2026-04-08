import { Dom } from "../../dom";
import { Game } from "../../game";

export function processPacket_chat(packet: Uint8Array, g: Game) {
   let idx = 1;

   let userName = '';
   for (; packet[idx]; ++idx) {
      userName += String.fromCharCode(packet[idx]);
   }

   let message = '';
   for (idx++; idx < packet.length; ++idx) {
      message += String.fromCharCode(packet[idx]);
   }

   Dom.addChatMessage(userName, message);
}