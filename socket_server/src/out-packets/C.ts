import { OutPackets } from './out-packets';
import { Room } from '../room';
import { Animation, Color } from '../game-types';

const packetChar = 'q'.charCodeAt(0);

// will change this packet soon

export function sendPacket_C(this: typeof OutPackets, target: Room) {
  const packet = new Uint8Array(1 + Object.values(Color).length * (3 + 3 + 1));

  packet[0] = packetChar;

  let idx = 1;
  Object.values(Color).forEach((color) => {
    let x = 0,
      y = 0;
    let anim = Animation.IDLE_FRONT;
    if (target[color]) {
      x = target[color].x;
      y = target[color].y;
      anim = target[color].animState;
    }

    x *= 1e4;
    y *= 1e4;

    packet[idx] = (x >>> 16) & 0xff;
    packet[idx + 1] = (x >>> 8) & 0xff;
    packet[idx + 2] = x & 0xff;
    idx += 3;

    packet[idx] = (y >>> 16) & 0xff;
    packet[idx + 1] = (y >>> 8) & 0xff;
    packet[idx + 2] = y & 0xff;
    idx += 3;

    packet[idx] = anim;
    idx += 1;
  });

  this.bufferPacket(target, packet);
}
