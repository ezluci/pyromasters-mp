import { MatchEvent } from './event';

export class MatchEvent_death extends MatchEvent {
  playerId: number;
  assists: number[];

  constructor(tick: number, playerId: number, assists: number[]) {
    super(tick, 'death');
    this.playerId = playerId;
    this.assists = assists;
  }
}
