import { OutPackets } from './out-packets';
import { Room } from '../room';
import { Map } from '../game-types';
import { WebSocket } from 'ws';

const packetChar = 'm'.charCodeAt(0);

export function sendPacket_map(
  this: typeof OutPackets,
  target: Room | WebSocket,
  map: Map,
) {
  const packet = new Uint8Array(1 + 20);

  packet[0] = packetChar;

  for (let i = 0; i < map.length; ++i) {
    packet[1 + i] = map.charCodeAt(i);
  }

  this.bufferPacket(target, packet);
}
