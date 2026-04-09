import { WebSocket } from 'ws';

// 2+2 bits for xvel and yvel
// 12 bits for bomb.id

export function processPacket_kickBomb(sok: WebSocket, packet: Buffer) {
  if (sok.isGuest) {
    return;
  }

  if (packet.length !== 1 + 2) {
    return;
  }

  const value = (packet[1] << 8) | packet[2];

  const bombId = value >>> (2 + 2);
  let xvel = (value >>> 2) & 0b11;
  let yvel = value & 0b11;

  const bomb = sok.room.getBomb(bombId);
  if (bomb === undefined || xvel === 0b11 || yvel === 0b11) {
    return;
  }

  if (xvel === 0b10) {
    xvel = -1;
  }
  if (yvel === 0b10) {
    yvel = -1;
  }

  if (
    !(
      (xvel === 0 && Math.abs(yvel) === 1) ||
      (Math.abs(xvel) === 1 && yvel === 0)
    )
  ) {
    return;
  }

  sok.kickBomb(bombId, xvel, yvel);
}
