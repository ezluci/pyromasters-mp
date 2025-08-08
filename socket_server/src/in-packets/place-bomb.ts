import { WebSocket } from "ws";

export function processPacket_placeBomb(sok: WebSocket, _packet: Buffer) {
   sok.placeBomb();
}