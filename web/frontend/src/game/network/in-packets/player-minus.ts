import { Game } from '../../game';

export function processPacket_playerMinus(packet: Uint8Array, g: Game) {
  const id =
    (packet[1] << 24) | (packet[2] << 16) | (packet[3] << 8) | packet[4];

  g.removePlayer(id);
}
