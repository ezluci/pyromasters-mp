import { WebSocket } from "ws";

export function processPacket_suicide(sok: WebSocket, _packet: Buffer) {
  if (sok.isGuest) {
    return;
  }
  
  sok.kill([]);
}