import { WebSocket } from "ws";
import { OutPackets } from "../out-packets/out-packets";

export function processPacket_chat(sok: WebSocket, packet: Buffer) {
  if (sok.isGuest) {
    return;
  }
  
  let idx = 1;
  let message = '';
  for (; idx < packet.length; ++idx) {
    message += String.fromCharCode(packet[idx]);
  }

  if (message === '') {
    return;
  }
  message = message.substring(0, 150);

  if (!/^[ -~]+$/.test(message)) {
    return;
  }

  OutPackets.send_chat(sok.room, sok, message);
}