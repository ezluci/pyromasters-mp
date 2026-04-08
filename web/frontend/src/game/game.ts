import { Dom } from "./dom";
import { drawBlock, drawFrame, drawPlayer, drawPlayerImage } from "./game-canvas";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { gameLoop } from "./game-loop";
import type { Network } from "./network/network";
import { Block, Bomb, Color, Map, Player, RoomStatus } from "./types";

export class Game {
  roomName: string;
  isGuest: boolean;

  myPlayer!: Player; // initialized in player-plus packet
  ping: number;
  deltaTime: number;

  ctx: CanvasRenderingContext2D;
  isMobile: boolean;

  map: Map | null;
  gameTime: number;
  roomStatus: RoomStatus;
  endScreen: Color | 'draw' | null;
  menuSoundId: number | null;

    // ranking: ..., // export const ranking: { name: string, wins: number, kills: number }[] = [];
  grid: Block[][];
  bombs: Bomb[];
  flames: number[][]; // counts how many flames there are in a spot

  players: globalThis.Map<number, Player>;
  colors: { [C in Color]: Player | null };

  network: Network;

  addPlayer: (id: number, name: string) => void;
  removePlayer: (id: number) => void;
  changePlayerColor: (id: number, newColor: Color | null) => void;
  startLoop: () => void;
  drawBlock: (image: HTMLImageElement, xblock: number, yblock: number, manualOffset?: number) => void;
  drawPlayerImage: (image: HTMLImageElement, x: number, y: number) => void;
  drawPlayer: (player: Player) => void;
  drawFrame: () => void;

  constructor(network: Network, roomName: string) {
    this.roomName = roomName;
    this.isGuest = (window as any).isGuest;
    this.ping = 0;
    this.deltaTime = 0;

    this.ctx = Dom.canvas.getContext('2d')!;
    this.isMobile = (window.location.pathname.toLowerCase() === '/gamemobile');

    this.map = null;
    this.gameTime = 0;
    this.roomStatus = RoomStatus.WAITING;
    this.endScreen = null;
    this.menuSoundId = null;

    // ranking: ..., // export const ranking: { name: string, wins: number, kills: number }[] = [];
    this.grid = Array.from({ length: BLOCKS_HORIZONTALLY }, () => Array(BLOCKS_VERTICALLY).fill(Block.NO)) as Block[][];
    this.bombs = [] as Bomb[];
    this.flames = Array.from({ length: BLOCKS_HORIZONTALLY }, () => Array(BLOCKS_VERTICALLY).fill(0)) as number[][];

    this.players = new globalThis.Map();
    this.colors = {
      white: null,
      black: null,
      orange: null,
      green: null
    } as { [C in Color]: Player | null };

    this.network = network;

    // functions
    this.addPlayer = addPlayer.bind(this);
    this.removePlayer = removePlayer.bind(this);
    this.changePlayerColor = changePlayerColor.bind(this);
    this.startLoop = () => {
      if (!this.isGuest) {
        Dom.loading.hidden = true;
        Dom.selectColors.hidden = false;
      }
      gameLoop(this);
    }
    this.drawBlock = drawBlock.bind(this);
    this.drawPlayerImage = drawPlayerImage.bind(this);
    this.drawPlayer = drawPlayer.bind(this);
    this.drawFrame = drawFrame.bind(this);
  }
}


function addPlayer(this: Game, id: number, name: string) {
  const player = new Player(id, name);
  this.players.set(id, player);
  Dom.addPlayer(player);
}

function removePlayer(this: Game, id: number) {
  const player = this.players.get(id);
  if (player) {
    Dom.removePlayer(player);
  }
  this.players.delete(id);
}

function changePlayerColor(this: Game, id: number, newColor: Color | null) {
  const player = this.players.get(id);
  if (!player) {
    return console.error('changePlayerColor: id not found');
  }

  if (player.color) {
    this.colors[player.color] = null;
  }
  player.color = newColor;
  if (player.color) {
    this.colors[player.color] = player;
  }

  Dom.updatePlayer(player);
}