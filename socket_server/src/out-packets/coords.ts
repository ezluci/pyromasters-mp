import { OutPackets } from './out-packets';
import { Room } from '../room';
import { WebSocket } from 'ws';
import { Color } from '../game-types';
import { logger } from '../log';

const packetChar = 'w'.charCodeAt(0);

export function sendPacket_coords(
  this: typeof OutPackets,
  target: Room | WebSocket,
  player: WebSocket,
) {
  const packet = new Uint8Array(1 + 1 + 6);

  if (!player.color) {
    return logger.error('sendPacket_coords: player null');
  }

  packet[0] = packetChar;

  const x = player.x * 1e4;
  const y = player.y * 1e4;

  packet[1] = Object.values(Color).indexOf(player.color);

  packet[2] = (x >>> 16) & 0xff;
  packet[3] = (x >>> 8) & 0xff;
  packet[4] = x & 0xff;

  packet[5] = (y >>> 16) & 0xff;
  packet[6] = (y >>> 8) & 0xff;
  packet[7] = y & 0xff;

  this.bufferPacket(target, packet);
}
