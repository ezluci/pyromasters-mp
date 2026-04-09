import { OutPackets } from './out-packets';
import { Room } from '../room';
import { WebSocket } from 'ws';

const packetChar = 'z'.charCodeAt(0);

export function sendPacket_guestCount(
  this: typeof OutPackets,
  target: Room | WebSocket,
  guestCount: number,
) {
  const packet = new Uint8Array(1 + 4);
  packet[0] = packetChar;

  packet[1] = guestCount >>> 24;
  packet[2] = guestCount >>> 16;
  packet[3] = guestCount >>> 8;
  packet[4] = guestCount;

  this.bufferPacket(target, packet);
}
