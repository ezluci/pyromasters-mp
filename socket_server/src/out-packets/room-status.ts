import { OutPackets } from './out-packets';
import { Room } from '../room';
import { RoomStatus } from '../game-types';
import { WebSocket } from 'ws';

const packetChar = 's'.charCodeAt(0);

export function sendPacket_roomStatus(
  this: typeof OutPackets,
  target: Room | WebSocket,
  status: RoomStatus,
) {
  const packet = new Uint8Array(2);

  packet[0] = packetChar;

  packet[1] =
    status === RoomStatus.WAITING ? 0 : status === RoomStatus.STARTING ? 1 : 2;

  this.bufferPacket(target, packet);
}
