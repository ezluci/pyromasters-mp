import { WebSocket } from 'ws';

export function processPacket_placeBomb(sok: WebSocket, _packet: Buffer) {
  if (sok.isGuest) {
    return;
  }

  sok.placeBomb();
}
