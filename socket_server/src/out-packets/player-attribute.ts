import { WebSocket } from 'ws';
import { Room } from '../room';
import { Color } from '../game-types';
import { OutPackets } from './out-packets';
import { BOMB_TIMES, MOVE_SPEEDS } from '../game-consts';
import { logger } from '../log';

// this type of packet sends to the target a specific attribute from the player 'sok'.

type PlayerAttribute =
  | 'isOwner'
  | 'wins'
  | 'kills'
  | 'color'
  | 'coords'
  | 'dead'
  | 'animState'
  | 'speed'
  | 'bombCount'
  | 'bombTime'
  | 'bombLength'
  | 'shield'
  | 'sick'
  | 'kickBombs';

export function sendPacket_playerAttribute(
  this: typeof OutPackets,
  target: Room | WebSocket,
  sok: WebSocket,
  attribute: PlayerAttribute,
) {
  const packetLength =
    2 +
    (attribute === 'dead' ||
    attribute === 'animState' ||
    attribute === 'speed' ||
    attribute === 'bombCount' ||
    attribute === 'bombTime' ||
    attribute === 'bombLength' ||
    attribute === 'shield' ||
    attribute === 'sick' ||
    attribute === 'kickBombs'
      ? 1
      : attribute === 'coords'
        ? 4
        : attribute === 'kills' || attribute === 'wins'
          ? 2
          : attribute === 'isOwner' || attribute === 'color'
            ? 4 // id bytes
            : 0);

  if (packetLength === 0) {
    return logger.error(
      `sendPacket_playerAttribute: attribute '${attribute}' unhandled`,
    );
  }

  const packet = new Uint8Array(packetLength);
  packet[1] =
    sok.color === null ? 0 : Object.values(Color).indexOf(sok.color) + 1;

  switch (attribute) {
    case 'isOwner':
      packet[0] = 0;
      packet[1] = sok.isOwner ? 1 : 0;
      packet[2] = sok.id >>> 24;
      packet[3] = sok.id >>> 16;
      packet[4] = sok.id >>> 8;
      packet[5] = sok.id;
      break;
    case 'wins':
      packet[0] = 1;
      const wins = Math.min(sok.wins, 0xffff);
      packet[2] = (wins >>> 8) & 0xff;
      packet[3] = wins & 0xff;
      break;
    case 'kills':
      packet[0] = 2;
      const kills = Math.min(sok.kills, 0xffff);
      packet[2] = (kills >>> 8) & 0xff;
      packet[3] = kills & 0xff;
      break;
    case 'color':
      packet[0] = 3;
      packet[2] = sok.id >>> 24;
      packet[3] = sok.id >>> 16;
      packet[4] = sok.id >>> 8;
      packet[5] = sok.id;
      break;
    case 'coords':
      packet[0] = 4;
      const x = Math.floor(sok.x * 70);
      const y = Math.floor(sok.y * 70);
      packet[2] = (x >>> 8) & 0xff;
      packet[3] = x & 0xff;
      packet[4] = (y >>> 8) & 0xff;
      packet[5] = y & 0xff;
      break;
    case 'dead':
      packet[0] = 5;
      packet[2] = sok.dead ? 1 : 0;
      break;
    case 'animState':
      packet[0] = 6;
      packet[2] = sok.animState;
      break;
    case 'speed':
      packet[0] = 7;
      packet[2] = MOVE_SPEEDS.indexOf(sok.speed);
      break;
    case 'bombCount':
      packet[0] = 8;
      packet[2] = sok.bombCount;
      break;
    case 'bombTime':
      packet[0] = 9;
      packet[2] = BOMB_TIMES.indexOf(sok.bombTime);
      break;
    case 'bombLength':
      packet[0] = 10;
      packet[2] = sok.bombLength;
      break;
    case 'shield':
      packet[0] = 11;
      packet[2] = sok.shield ? 1 : 0;
      break;
    case 'sick':
      packet[0] = 12;
      packet[2] = sok.sick ? 1 : 0;
      break;
    case 'kickBombs':
      packet[0] = 13;
      packet[2] = sok.kickBombs ? 1 : 0;
      break;
    default:
      return logger.error(
        `sendPacket_playerAttribute: attribute '${attribute}' unhandled`,
      );
  }

  this.bufferPacket(target, packet);
}
