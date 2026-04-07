import { Dom } from "./dom";
import { drawBlock, drawFrame, drawPlayer, drawPlayerImage } from "./game-canvas";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { gameLoop } from "./game-loop";
import type { Network } from "./network/network";
import { Block, Bomb, Color, Map, Player, RoomStatus } from "./types";

export class Game {
   userName: string;
   roomName: string;
   myPlayer!: Player;
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

   players: globalThis.Map<string, Player>;
   colors: { [C in Color]: Player | null };

   network: Network;

   addPlayer: (userName: string) => void;
   removePlayer: (userName: string) => void;
   changePlayerColor: (playerUserName: string, newColor: Color | null) => void;
   startLoop: () => void;
   drawBlock: (image: HTMLImageElement, xblock: number, yblock: number, manualOffset?: number) => void;
   drawPlayerImage: (image: HTMLImageElement, x: number, y: number) => void;
   drawPlayer: (player: Player) => void;
   drawFrame: () => void;

   constructor(network: Network, userName: string, roomName: string) {
      this.userName = userName;
      this.roomName = roomName;
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

      this.players = new globalThis.Map() as globalThis.Map<string, Player>;
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
         Dom.loading.hidden = true;
         Dom.selectColors.hidden = false;
         gameLoop(this);
      }
      this.drawBlock = drawBlock.bind(this);
      this.drawPlayerImage = drawPlayerImage.bind(this);
      this.drawPlayer = drawPlayer.bind(this);
      this.drawFrame = drawFrame.bind(this);
   }
}


function addPlayer(this: Game, userName: string) {
   Dom.addPlayer(userName);
   const player = new Player(userName);
   this.players.set(userName, player);
}

function removePlayer(this: Game, userName: string) {
   Dom.removePlayer(userName);
   this.players.delete(userName);
}

function changePlayerColor(this: Game, playerUserName: string, newColor: Color | null) {
   Dom.changePlayerColor(playerUserName, newColor);

   const player = this.players.get(playerUserName);
   if (!player) {
      return console.error('changePlayerColor: playerUserName not found');
   }

   if (player.color) {
      this.colors[player.color] = null;
   }
   player.color = newColor;
   if (player.color) {
      this.colors[player.color] = player;
   }
}