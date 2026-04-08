import { WebSocket } from "ws";
import { Animation, Block, Color, Map, RoomStatus } from "../game-types";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BOMB_TIMES, DEFAULT_POS, MAP_FOURWAY_PORTAL_POSITIONS, MOVE_SPEEDS } from "../game-consts";
import { OutPackets } from "../out-packets/out-packets";

export function processPacket_startGame(sok: WebSocket, packet: Buffer) {
  if (sok.isGuest) {
    return;
  }
  
  if (packet.length !== 2) {
    return;
  }
  
  if (sok.room.status === RoomStatus.STARTING || sok.room.status === RoomStatus.RUNNING) {
    OutPackets.send_error(sok, `tryStart: Room is in ${sok.room.status} status.`);
    return;
  }
  
  if (!sok.isOwner) {
    OutPackets.send_error(sok, 'tryStart: You are not the owner of this room!');
    return;
  }

  let map = (
    packet[1] >= Object.values(Map).length ? undefined :
    Object.values(Map)[packet[1]]
  );

  if (map === undefined) {
    return;
  }

  // maybe this stuff needs to be moved in room.startGame()

  if (map === Map.RANDOM) {
    const randomMaps = Object.values(Map);
    randomMaps.splice(randomMaps.indexOf(Map.TESTMAP), 1);
    randomMaps.splice(randomMaps.indexOf(Map.RANDOM), 1);
    map = randomMaps[Math.floor(Math.random() * randomMaps.length)];
  }


  let playersAlive: Color[] = [];
  Object.values(Color).forEach((color) => {
    if (sok.room[color]) {
        playersAlive.push(color);
    }
  });
  
  if (playersAlive.length === 0) {
    OutPackets.send_error(sok, 'tryStart: You can\'t start the game with NO PLAYERS, silly!');
    return;
  }

  sok.room.countPlayersAlive = playersAlive.length;

  sok.room.status = RoomStatus.STARTING;
  OutPackets.send_roomStatus(sok.room, sok.room.status);

  sok.room.grid = generateGrid(map);

  /// set stats for each color
  Object.values(Color).forEach(color => {
    if (!sok.room[color]) {
        return;
    }
    
    sok.room[color].animState = Animation.IDLE_FRONT;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'animState');

    sok.room[color].x = DEFAULT_POS[color].x;
    sok.room[color].y = DEFAULT_POS[color].y;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'coords');
    sok.room[color].dead = false;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'dead');
    
    sok.room[color].speed = MOVE_SPEEDS[0];
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'speed');
    sok.room[color].bombCount = 1;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombCount');
    sok.room[color].bombTime = BOMB_TIMES[0];
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombTime');
    sok.room[color].bombLength = 2;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombLength');

    sok.room[color].shieldFalse_tickId = 0;
    sok.room[color].setShield(false);

    sok.room[color].sickFalse_tickId = 0;
    sok.room[color].setSick(false);

    sok.room[color].kickBombs = false;
    OutPackets.send_playerAttribute(sok.room, sok.room[color], 'kickBombs');
    
    if (map === Map.TESTMAP) {
        sok.room[color].speed = MOVE_SPEEDS[MOVE_SPEEDS.length - 1];
        OutPackets.send_playerAttribute(sok.room, sok.room[color], 'speed');
        sok.room[color].bombCount = 4;
        OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombCount');
        sok.room[color].bombTime = BOMB_TIMES[BOMB_TIMES.length - 1];
        OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombTime');
        sok.room[color].bombLength = 14;
        OutPackets.send_playerAttribute(sok.room, sok.room[color], 'bombLength');
        sok.room[color].kickBombs = true;
        OutPackets.send_playerAttribute(sok.room, sok.room[color], 'kickBombs');
        
        sok.room[color].setShield(true);
    }
  });

  if (map === Map.TESTMAP) {
    map = Map.BRICKTOWN;
  }

  sok.room.bombs.length = 0;
  sok.room.flames.length = 0;
  sok.room.map = map;
  sok.room.endgameBlocks = 0;
  sok.room.endscreen_tickId = null;
  sok.room.bombIdCounter = 0;
  sok.room.singlePlayer = (playersAlive.length === 1);

  sok.room.ticks.startTickLoop();

  sok.room.ticks.addFunc(() => {
    sok.room.status = RoomStatus.RUNNING;
    OutPackets.send_roomStatus(sok.room, sok.room.status);
  }, sok.room.ticks.TPS * 2);

  sok.room.gameTime = 120; // 2 minutes
  OutPackets.send_gameTime(sok.room, sok.room.gameTime);

  OutPackets.send_map(sok.room, sok.room.map);
  for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
    for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
        OutPackets.send_gridUpdate(sok.room, x, y, sok.room.grid[x][y]);
    }
  }

  for (let i = 0; i < sok.room.gameTime; i++) {
    sok.room.ticks.addFunc(() => {
        sok.room.gameTime --;
        OutPackets.send_gameTime(sok.room, sok.room.gameTime);
        
        if (sok.room.gameTime % 20 === 16) {
          OutPackets.send_playSound(sok.room, 'taunt');
        } else if (sok.room.gameTime === 5) {
          OutPackets.send_playSound(sok.room, 'hurrymain');
        } else if (sok.room.gameTime === 3) {
          OutPackets.send_playSound(sok.room, 'hurry');
        }
    }, sok.room.ticks.TPS * (2 + i));
  }
  for (let i = 0; i < BLOCKS_HORIZONTALLY * BLOCKS_VERTICALLY; i++) {
    sok.room.ticks.addFunc(sok.room.placeEndgameBlock, sok.room.ticks.TPS * (2 + sok.room.gameTime + 0.84 * i));
  }
}


function generateGrid(map: string): Block[][] {
  const grid: Block[][] = Array.from({ length: BLOCKS_HORIZONTALLY }, () => Array(BLOCKS_VERTICALLY).fill(Block.NO)) as Block[][];
  
  if (map === Map.TESTMAP) {
    for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
        for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
          if (y % 2 == 1 && x % 2 == 1) {
              grid[x][y] = Block.PERMANENT;
          }
        }
    }

    grid[4][4] = Block.POWER_SHIELD;
    grid[6][4] = Block.POWER_SWITCHPLAYER;
    grid[6][6] = Block.POWER_KICKBOMBS;
    grid[8][8] = Block.POWER_SICK;
    grid[10][8] = Block.POWER_SICK;
    grid[2][2] = Block.POWER_BONUS;
    grid[4][2] = Block.POWER_BONUS;
    grid[6][2] = Block.POWER_BONUS;
    grid[8][2] = Block.POWER_BONUS;
    grid[10][2] = Block.POWER_BOMBPLUS;
    
    return grid;
  }

  for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
    for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
        if (y % 2 == 1 && x % 2 == 1) {
          grid[x][y] = Block.PERMANENT;
        } else {
          let canDraw = true;
          const blockedCoords: { x: number, y: number }[] = [
              { x: 0, y: 0 },
              { x: 0, y: 1 },
              { x: 1, y: 0 },
              { x: 0, y: BLOCKS_VERTICALLY - 2 },
              { x: 0, y: BLOCKS_VERTICALLY - 1 },
              { x: 1, y: BLOCKS_VERTICALLY - 1 },
              { x: BLOCKS_HORIZONTALLY - 2, y: 0 },
              { x: BLOCKS_HORIZONTALLY - 1, y: 0 },
              { x: BLOCKS_HORIZONTALLY - 1, y: 1 },
              { x: BLOCKS_HORIZONTALLY - 2, y: BLOCKS_VERTICALLY - 1 },
              { x: BLOCKS_HORIZONTALLY - 1, y: BLOCKS_VERTICALLY - 1 },
              { x: BLOCKS_HORIZONTALLY - 1, y: BLOCKS_VERTICALLY - 2 }
          ];
          
          blockedCoords.forEach(blockedCoord => {
              if (x === blockedCoord.x && y === blockedCoord.y)
                canDraw = false;
          });

          if (map === Map.FOURWAY) {
              MAP_FOURWAY_PORTAL_POSITIONS.forEach(({x: xPortal, y: yPortal}) => {
                if (xPortal === x && yPortal === y) {
                    canDraw = false;
                }
              });
          }

          if (canDraw) {
              if (Math.random() >= .2) {
                grid[x][y] = Block.NORMAL;
              }
          }
        }
    }
  }

  return grid;
}