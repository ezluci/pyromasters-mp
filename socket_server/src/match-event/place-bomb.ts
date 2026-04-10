import { Bomb } from '../game-types';
import { MatchEvent } from './event';

export class MatchEvent_placeBomb extends MatchEvent {
  playerId: number;
  x: number;
  y: number;

  constructor(tick: number, bomb: Bomb) {
    super(tick, 'placeBomb');
    this.playerId = bomb.owner.id;
    this.x = bomb.x;
    this.y = bomb.y;
  }
}
