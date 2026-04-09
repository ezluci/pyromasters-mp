import { WebSocket } from 'ws';
import { OutPackets } from './out-packets';
import { logger } from '../log';

const packetChar = ':'.charCodeAt(0);

export function sendPacket_pong(
  this: typeof OutPackets,
  target: WebSocket,
  time: number,
) {
  const packet = new Uint8Array(1 + 3);

  packet[0] = packetChar;

  packet[1] = time >>> 16;
  packet[2] = time >>> 8;
  packet[3] = time;

  const frame = this.constructFrame([
    { data: packet, time: performance.now() },
  ]);
  if (!frame) {
    logger.error(`can\'t send pong: ${frame}`);
    return;
  }
  this.sendFrame(target, frame);
}
