import { Game } from '../../game';

const packetChar = 'P'.charCodeAt(0);

export function sendPacket_portalTp(g: Game) {
  const packet = new Uint8Array(1);

  packet[0] = packetChar;

  g.network.server.send(packet);
}
