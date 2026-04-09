import { Dom } from '../../dom';
import { Game } from '../../game';

export function processPacket_guestCount(packet: Uint8Array, g: Game) {
  const guestCount =
    (packet[1] << 24) | (packet[2] << 16) | (packet[3] << 8) | packet[4];

  Dom.updateGuestCount(guestCount);
}
