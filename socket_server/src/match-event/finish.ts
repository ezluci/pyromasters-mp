import { MatchEvent } from './event';

export class MatchEvent_finish extends MatchEvent {
  constructor(tick: number) {
    super(tick, 'finish');
  }
}
