import { Color } from '../game-types';
import { Room } from '../room';
import { MatchEvent } from './event';

export class MatchEvent_startGame extends MatchEvent {
  playerId: number;
  map: string | null;
  playersByColors: { color: string; playerId: number }[];

  constructor(tick: number, playerId: number, room: Room) {
    super(tick, 'startGame');
    this.playerId = playerId;
    this.map = room.map;
    this.playersByColors = [];
    Object.values(Color).forEach((color) => {
      if (room[color]) {
        this.playersByColors.push({ color: color, playerId: room[color].id });
      }
    });
  }
}
