import { WebSocket } from 'ws';
import { OutPackets } from './out-packets';
import { Room } from '../room';

const packetChar = 'r'.charCodeAt(0);

// TODO

export function sendPacket_ranking(
  this: typeof OutPackets,
  target: Room | WebSocket,
  x: number,
  y: number,
  id: number,
) {
  const packet = new Uint8Array(1 + 4);

  packet[0] = packetChar;

  packet[1] = x;
  packet[2] = y;
  packet[3] = id >>> 8;
  packet[4] = id & 0xff;

  this.bufferPacket(target, packet);
}
