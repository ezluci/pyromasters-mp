import { WebSocket } from 'ws';
import { Color } from '../game-types';
import { OutPackets } from '../out-packets/out-packets';
import { MatchEvent_death } from '../match-event/death';
import { logger } from '../log';

export function kill(this: WebSocket, assists: Color[]): void {
  const sok = this;
  if (sok.dead || !sok.color) {
    return;
  }

  sok.room.countPlayersAlive--;
  OutPackets.send_death(sok.room, sok.color);
  OutPackets.send_playSound(sok.room, 'dead');

  const assistsIds: number[] = [];
  assists.forEach((color) => {
    if (!this.room[color]) {
      logger.error(`assist color not good ${color} for ${this.id}`);
      return;
    }
    assistsIds.push(this.room[color].id);
  });

  sok.room.matchEvents.push(
    new MatchEvent_death(sok.room.ticks.tick, this.id, assistsIds),
  );

  sok.dead = true;

  assists.forEach((assistColor) => {
    if (assistColor !== sok.color) {
      // don't count own death
      if (sok.room[assistColor]) {
        sok.room[assistColor].kills++;
      }
    }
  });
}
