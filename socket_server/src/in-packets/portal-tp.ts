import { WebSocket } from "ws";
import { OutPackets } from "../out-packets/out-packets";

export function processPacket_portalTp(sok: WebSocket, _packet: Buffer) {
  if (sok.isGuest) {
    return;
  }
  
  OutPackets.send_playSound(sok.room, 'teleport');
}