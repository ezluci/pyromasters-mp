import { WebSocket } from 'ws';
import { OutPackets } from './out-packets';
import { Room } from '../room';

const packetChar = '/'.charCodeAt(0);

export function sendPacket_deleteBomb(
  this: typeof OutPackets,
  target: Room | WebSocket,
  id: number,
) {
  const packet = new Uint8Array(1 + 2);

  packet[0] = packetChar;

  packet[1] = id >>> 8;
  packet[2] = id & 0xff;

  this.bufferPacket(target, packet);
}
