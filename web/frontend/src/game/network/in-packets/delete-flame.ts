import { Game } from '../../game';

export function processPacket_deleteFlame(packet: Uint8Array, g: Game) {
  const x = packet[1];
  const y = packet[2];
  g.flames[x][y]--;
}
