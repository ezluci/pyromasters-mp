export class MatchEvent {
  constructor(
    public tick: number,
    public eventName: 'death' | 'finish' | 'placeBomb' | 'startGame',
  ) {}
}
