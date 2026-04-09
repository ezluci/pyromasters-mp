import { Dom } from '../../dom';
import { Game } from '../../game';

export function processPacket_pong(packet: Uint8Array, g: Game) {
  if ((window as any).testnopong) return;

  const time = (packet[1] << 16) | (packet[2] << 8) | packet[3];

  const index = g.network.unresolvedPings.indexOf(time);
  if (index === -1) {
    return;
  }
  g.network.unresolvedPings.splice(0, index + 1);

  const ping = (performance.now() - time) & g.network.timeBitmask;
  Dom.ping.innerText = `ping: ${ping}`;
}
