import { Socket } from "socket.io";
import { Animation, Block, Color, Coord, RoomStatus } from "../game-types";
import { ALL_COLORS, ALL_MAPS, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BOMB_TIMES, DEFAULT_POS, MAP_FOURWAY_PORTAL_POSITIONS, MOVE_SPEEDS } from "../game-consts";

export function tryStart(mapName: string, sok: Socket): void {
   const io = sok.nsp.server;
   if (sok.room.status === RoomStatus.STARTING || sok.room.status === RoomStatus.RUNNING) {
      sok.emit('error', `tryStart: Room is in ${sok.room.status} status.`);
      return;
   }
   
   if (!sok.isOwner) {
      sok.emit('error', 'tryStart: You are not the owner of this room!');
      return;
   }

   if (mapName === 'random') {
      mapName = ALL_MAPS[Math.floor(Math.random() * ALL_MAPS.length)];
   }
   
   if (ALL_MAPS.filter((map) => mapName === map).length === 0 && mapName !== 'testmap:)') {
      sok.emit('error', 'tryStart: invalid map name');
      return;
   }
   

   let playersAlive: Color[] = [];
   ALL_COLORS.forEach((color) => {
      if (sok.room[color]) {
         playersAlive.push(color);
      }
   });
   
   if (playersAlive.length === 0) {
      sok.emit('error', 'tryStart: You can\'t start the game with NO PLAYERS, silly!');
      return;
   }

   sok.room.countPlayersAlive = playersAlive.length;

   io.to(sok.room.name).emit('playersAlive', playersAlive);

   /// set stats for each color
   ALL_COLORS.forEach(color => {
      if (!sok.room[color]) {
         return;
      }
      
      sok.room[color].animState = Animation.IDLE;

      sok.room[color].coords = { ...DEFAULT_POS[color] };
      sok.room[color].dead = false;
      
      sok.room[color].speed = MOVE_SPEEDS[0];
      sok.room[color].bombCount = 1;
      sok.room[color].bombTime = BOMB_TIMES[0];
      sok.room[color].bombLength = 2;

      sok.room[color].shield = false;
      sok.room[color].shieldFalse_tickId = 0;

      sok.room[color].sick = false;
      sok.room[color].sickFalse_tickId = 0;

      sok.room[color].kickBombs = false;

      io.to(sok.room.name).emit('coords', color, sok.room[color].coords, sok.room[color].animState);
      
      if (mapName === 'testmap:)') {
         sok.room[color].speed = MOVE_SPEEDS[MOVE_SPEEDS.length - 1];
         sok.room[color].bombCount = 4;
         sok.room[color].bombTime = BOMB_TIMES[BOMB_TIMES.length - 1];
         sok.room[color].bombLength = 14;
         sok.room[color].kickBombs = true;
      }
   })

   sok.room.mapName = mapName;
   sok.room.map = generateMap(mapName);
   sok.room.endgameBlocks = 0;
   sok.room.endscreen_tickId = null;
   sok.room.bombIdCounter = 1;
   sok.room.singlePlayer = (playersAlive.length === 1);


   sok.room.ticks.startTickLoop();

   sok.room.ticks.addFunc(() => { sok.room.status = RoomStatus.STARTING; }, sok.room.ticks.TPS * 0);
   sok.room.ticks.addFunc(() => { sok.room.status = RoomStatus.RUNNING; }, sok.room.ticks.TPS * 2);

   sok.room.gameTime = 120; // 2 minutes

   for (let i = 0; i < sok.room.gameTime; i++) {
      sok.room.ticks.addFunc(() => {
         sok.room.gameTime --;
         io.to(sok.room.name).emit('gameTime', sok.room.gameTime);
      }, sok.room.ticks.TPS * (2 + i));
   }
   for (let i = 0; i < BLOCKS_HORIZONTALLY * BLOCKS_VERTICALLY; i++) {
      sok.room.ticks.addFunc(sok.room.placeEndgameBlock, sok.room.ticks.TPS * (2 + sok.room.gameTime + 0.84 * i));
   }
}


function generateMap(mapName: string): Block[][] {
   const map: Block[][] = [];
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
      map[y] = [];
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         map[y][x] = Block.NO; // default block
      }
   }
   
   if (mapName === 'testmap:)') {
      for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
         for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
            if (y % 2 == 1 && x % 2 == 1) {
               map[y][x] = Block.PERMANENT;
            }
         }
      }
      map[4][4] = Block.POWER_SHIELD;
      map[4][6] = Block.POWER_SWITCHPLAYER;
      map[6][6] = Block.POWER_KICKBOMBS;
      map[8][8] = Block.POWER_SICK;
      map[8][10] = Block.POWER_SICK;
      
      return map;
   }

   for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         if (y % 2 == 1 && x % 2 == 1) {
            map[y][x] = Block.PERMANENT;
         } else {
            let canDraw = true;
            const blockedCoords: Coord[] = [
               { x: 0, y: 0 },
               { x: 0, y: 1 },
               { x: 1, y: 0 },
               { x: 0, y: BLOCKS_HORIZONTALLY - 2 },
               { x: 0, y: BLOCKS_HORIZONTALLY - 1 },
               { x: 1, y: BLOCKS_HORIZONTALLY - 1 },
               { x: BLOCKS_VERTICALLY - 2, y: 0 },
               { x: BLOCKS_VERTICALLY - 1, y: 0 },
               { x: BLOCKS_VERTICALLY - 1, y: 1 },
               { x: BLOCKS_VERTICALLY - 2, y: BLOCKS_HORIZONTALLY - 1 },
               { x: BLOCKS_VERTICALLY - 1, y: BLOCKS_HORIZONTALLY - 1 },
               { x: BLOCKS_VERTICALLY - 1, y: BLOCKS_HORIZONTALLY - 2 }
            ];
            
            blockedCoords.forEach(blockedCoord => {
               if (y == blockedCoord.x && x == blockedCoord.y)
                  canDraw = false;
            });

            if (mapName === 'fourway') {
               MAP_FOURWAY_PORTAL_POSITIONS.forEach(({x: xPortal, y: yPortal}) => {
                  if (xPortal === x && yPortal === y) {
                     canDraw = false;
                  }
               });
            }

            if (canDraw) {
               if (Math.random() >= .2) {
                  map[y][x] = Block.NORMAL;
               }
            }
         }
      }
   }

   return map;
}