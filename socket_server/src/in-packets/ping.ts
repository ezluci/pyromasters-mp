import { WebSocket } from 'ws';
import { OutPackets } from '../out-packets/out-packets';

export function processPacket_ping(sok: WebSocket, packet: Buffer) {
  if (packet.length !== 1 + 3) {
    return;
  }

  const time = (packet[1] << 16) | (packet[2] << 8) | packet[3];
  sok.lastReceivedPing = performance.now();

  OutPackets.send_pong(sok, time);
}
