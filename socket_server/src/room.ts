import { Block, Bomb, Flame, Map, RoomStatus } from './game-types';
import { Ticks } from './ticks';
import { generate_runEveryTick } from './run-every-tick';
import { generate_placeEndgameBlock } from './room-functions/endgame';
import { generate_showEndScreen } from './room-functions/endscreen';
import { WebSocket } from 'ws';
import {
  explodeBomb,
  getBomb,
  getFlame,
  removeFlame,
} from './room-functions/bombs';

export class Room {
  name: string;
  displayName: string;
  owner: WebSocket;

  players: globalThis.Map<string, WebSocket>; // <name, sok>
  guests: Set<WebSocket>;
  countPlayersAlive: number;

  white: WebSocket | null;
  black: WebSocket | null;
  orange: WebSocket | null;
  green: WebSocket | null;

  grid: Block[][];
  map: Map | null;

  bombs: Bomb[];
  bombIdCounter: number;
  flames: Flame[];
  gameTime: number;
  endscreen_tickId: number | null;
  endgameBlocks: number;
  status: RoomStatus;

  ticks: Ticks;
  singlePlayer: boolean; // the owner of the room is playing alone

  // METHODS:

  placeEndgameBlock: () => void;
  getBomb: {
    (x: number, y: number): Bomb | undefined;
    (id: number): Bomb | undefined;
  };
  getFlame: (x: number, y: number, owner: WebSocket) => Flame | undefined;
  explodeBomb: (bombId: number, recursive?: boolean, flames?: Flame[]) => void;
  removeFlame: (x: number, y: number, owner: WebSocket) => void;
  showEndScreen: () => void;

  constructor(name: string, owner: WebSocket) {
    this.name = name.toLowerCase();
    this.displayName = name;
    this.owner = owner;

    this.players = new globalThis.Map<string, WebSocket>();
    this.guests = new Set();
    this.countPlayersAlive = 0;

    this.white = this.black = this.orange = this.green = null;

    this.grid = [];
    this.map = null;

    this.bombs = [];
    this.bombIdCounter = 0;
    this.flames = [];
    this.gameTime = 0;
    this.endscreen_tickId = 0;
    this.endgameBlocks = 0;
    this.status = RoomStatus.WAITING;

    this.ticks = new Ticks(owner, generate_runEveryTick(owner));
    this.singlePlayer = false;

    this.placeEndgameBlock = generate_placeEndgameBlock(this);
    this.getBomb = getBomb;
    this.getFlame = getFlame;
    this.explodeBomb = explodeBomb;
    this.removeFlame = removeFlame;
    this.showEndScreen = generate_showEndScreen(this);
  }
}
