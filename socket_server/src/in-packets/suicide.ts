import { WebSocket } from "ws";

export function processPacket_suicide(sok: WebSocket, _packet: Buffer) {
   sok.kill([]);
}