import { WebSocket } from 'ws';
import { OutPackets } from './out-packets';
import { Room } from '../room';

const packetChar = '~'.charCodeAt(0);

export function sendPacket_updateBomb(
  this: typeof OutPackets,
  target: Room | WebSocket,
  x: number,
  y: number,
  id: number,
) {
  const packet = new Uint8Array(1 + 8);

  packet[0] = packetChar;

  x *= 1e4;
  y *= 1e4;

  packet[1] = (x >>> 16) & 0xff;
  packet[2] = (x >>> 8) & 0xff;
  packet[3] = x & 0xff;

  packet[4] = (y >>> 16) & 0xff;
  packet[5] = (y >>> 8) & 0xff;
  packet[6] = y & 0xff;

  packet[7] = id >>> 8;
  packet[8] = id & 0xff;

  this.bufferPacket(target, packet);
}
