import { Game } from '../../game';
import { Color } from '../../types';

const packetChar = 'O'.charCodeAt(0);

export function sendPacket_selectColor(g: Game, color: Color | null) {
  const packet = new Uint8Array(2);

  packet[0] = packetChar;

  if (color === null) {
    packet[1] = 0;
  } else {
    packet[1] = 1 + Object.values(Color).indexOf(color);
  }

  g.network.server.send(packet);
}
