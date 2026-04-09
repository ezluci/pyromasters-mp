import { WebSocket } from 'ws';
import { Animation } from '../game-types';
import { OutPackets } from '../out-packets/out-packets';

export function processPacket_coords(sok: WebSocket, packet: Buffer) {
  if (sok.isGuest) {
    return;
  }

  if (packet.length !== 1 + 7) {
    return;
  }

  const x = ((packet[1] << 16) | (packet[2] << 8) | packet[3]) * 1e-4;
  const y = ((packet[4] << 16) | (packet[5] << 8) | packet[6]) * 1e-4;
  const animation: Animation = packet[7];

  if (animation >= Object.values(Animation).length) {
    return;
  }

  if (sok.color === null) {
    OutPackets.send_error(sok, 'coords: You are a spectator.');
    return;
  }

  if (sok.dead) {
    OutPackets.send_error(sok, "coords: Player is 'dead'");
    return;
  }

  sok.x = x;
  sok.y = y;
  sok.animState = animation;
}
