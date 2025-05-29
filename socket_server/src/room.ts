import { Server, Socket } from "socket.io";
import { Block, Bomb, Flame, RoomStatus } from "./game-types";
import { Ticks } from "./ticks";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { generate_runEveryTick } from "./run-every-tick";
import { generate_placeEndgameBlock } from "./room-functions/place-endgame-block";
import { generate_explodeBomb, generate_getBomb, generate_getFlame, generate_removeFlame } from "./room-functions/bombs";
import { generate_showEndScreen } from "./room-functions/show-end-screen";


export class Room {
   name: string;
   displayName: string;
   owner: Socket;

   io: Server;
   players: Map<string, Socket>; // <name, sok>
   countPlayersAlive: number;
   
   white: Socket | null;
   black: Socket | null;
   orange: Socket | null;
   green: Socket | null;
   
   private _map: Block[][];
   private _mapName: string | null;

   bombs: Bomb[];
   bombIdCounter: number;
   flames: Flame[];
   gameTime: number;
   endscreen_tickId: number | null;
   endgameBlocks: number;
   private _status: RoomStatus;
   
   ticks: Ticks;
   singlePlayer: boolean; // the owner of the room is playing alone

   // METHODS:

   placeEndgameBlock: () => void;
   getBomb: {
      (x: number, y: number): Bomb | undefined;
      (id: number): Bomb | undefined;
   };
   getFlame: (x: number, y: number, owner: Socket) => Flame | undefined;
   explodeBomb: (bombId: number, recursive?: boolean, flames?: Flame[]) => void;
   removeFlame: (x: number, y: number, owner: Socket) => void;
   showEndScreen: () => void;


   constructor(name: string, owner: Socket) {
      this.name = name.toLowerCase();
      this.displayName = name;
      this.owner = owner;

      this.io = owner.nsp.server;
      this.players = new Map<string, Socket>();
      this.countPlayersAlive = 0;

      this.white = this.black = this.orange = this.green = null;

      this._map = [];
      this._mapName = null;

      this.bombs = [];
      this.bombIdCounter = 0;
      this.flames = [];
      this.gameTime = 0;
      this.endscreen_tickId = 0;
      this.endgameBlocks = 0;
      this._status = RoomStatus.WAITING;

      this.ticks = new Ticks(owner, generate_runEveryTick(owner));
      this.singlePlayer = false;

      this.placeEndgameBlock = generate_placeEndgameBlock(this);
      this.getBomb = generate_getBomb(this);
      this.getFlame = generate_getFlame(this);
      this.explodeBomb = generate_explodeBomb(this);
      this.removeFlame = generate_removeFlame(this);
      this.showEndScreen = generate_showEndScreen(this);
   }

   get map(): Block[][] {
      return this._map;
   }

   set map(newMap: Block[][]) {
      this._map = [];

      const updates: {x: number, y: number, block: Block}[] = [];
      for (let i = 0; i < BLOCKS_VERTICALLY; i += 1) {
         if (newMap[i].length !== BLOCKS_HORIZONTALLY) {
            console.error('incorrect map set');
            return;
         }
         this._map[i] = [];

         for (let j = 0; j < BLOCKS_HORIZONTALLY; j += 1) {
            this._map[i][j] = newMap[i][j];
            updates.push({ x: j, y: i, block: this._map[i][j] });
         }
      }

      this.io.to(this.name).emit('mapUpdates', updates);
   }

   get mapName(): string | null {
      return this._mapName;
   }

   set mapName(newName: string | null) {
      this._mapName = newName;
      this.io.to(this.name).emit('mapName', newName);
   }

   get status(): RoomStatus {
      return this._status;
   }

   set status(newStatus: RoomStatus) {
      this._status = newStatus;
      this.io.to(this.name).emit('room_status', newStatus);
   }
}