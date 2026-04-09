import { Animation, Color } from '../../types';
import { Game } from '../../game';

export function processPacket_C(packet: Uint8Array, g: Game) {
  let idx = 1;
  Object.values(Color).forEach((color) => {
    const x =
      ((packet[idx] << 16) | (packet[idx + 1] << 8) | packet[idx + 2]) * 1e-4;
    idx += 3;

    const y =
      ((packet[idx] << 16) | (packet[idx + 1] << 8) | packet[idx + 2]) * 1e-4;
    idx += 3;

    const anim: Animation = packet[idx];
    idx += 1;

    if (color !== g.myPlayer?.color && g.colors[color]) {
      g.colors[color].x = x;
      g.colors[color].y = y;
      g.colors[color].animState = anim;
    }
  });
}
