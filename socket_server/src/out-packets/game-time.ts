import { WebSocket } from 'ws';
import { OutPackets } from './out-packets';
import { Room } from '../room';

const packetChar = 't'.charCodeAt(0);

export function sendPacket_gameTime(
  this: typeof OutPackets,
  target: Room | WebSocket,
  time: number,
) {
  const packet = new Uint8Array(1 + 2);

  packet[0] = packetChar;

  packet[1] = time >>> 8;
  packet[2] = time & 0xff;

  this.bufferPacket(target, packet);
}
