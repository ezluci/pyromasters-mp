import { WebSocket } from "ws";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BOMB_TIMES, isPowerup, MOVE_SPEEDS } from "../game-consts";
import { Block, Color } from "../game-types";
import { OutPackets } from "../out-packets/out-packets";

function collectPowerupBombplus(sok: WebSocket) {
   if (sok.bombCount < 4) {
      sok.bombCount ++;
      OutPackets.send_playerAttribute(sok.room, sok, 'bombCount');
   }
}

function collectPowerupBomblength(sok: WebSocket) {
   sok.bombLength += 2;
   if (sok.bombLength > 14) {
      sok.bombLength = 14;
   }
   OutPackets.send_playerAttribute(sok.room, sok, 'bombLength');
}

function collectPowerupSpeed(sok: WebSocket) {
   const index = MOVE_SPEEDS.indexOf(sok.speed);
   sok.speed = MOVE_SPEEDS[Math.min(index + 1, MOVE_SPEEDS.length - 1)];
   OutPackets.send_playerAttribute(sok.room, sok, 'speed');
}

function collectPowerupShield(sok: WebSocket) {
   sok.setShield(true);
}

function collectPowerupKickbombs(sok: WebSocket) {
   sok.kickBombs = true;
   OutPackets.send_playerAttribute(sok.room, sok, 'kickBombs');
}

function collectPowerupBombtime(sok: WebSocket) {
   const index = BOMB_TIMES.indexOf(sok.bombTime);
   sok.bombTime = BOMB_TIMES[Math.min(index + 1, BOMB_TIMES.length - 1)];
   OutPackets.send_playerAttribute(sok.room, sok, 'bombTime');
}

function collectPowerupSwitchplayer(sok: WebSocket) {
   const otherPlayers: Color[] = [];
   Object.values(Color).forEach(otherColor => {
      if (sok.room[otherColor] && !sok.room[otherColor].dead && otherColor !== sok.color) {
         otherPlayers.push(otherColor);
      }
   });

   if (otherPlayers.length === 0) {
      return;
   }
   
   const randIdx = Math.floor(Math.random() * otherPlayers.length);
   const randColor = otherPlayers[randIdx];
   if (!sok.room[randColor]) {
      return;
   }

   [sok.coords.x, sok.room[randColor].coords.x] = [sok.room[randColor].coords.x, sok.coords.x];
   [sok.coords.y, sok.room[randColor].coords.y] = [sok.room[randColor].coords.y, sok.coords.y];
   
   OutPackets.send_coords(sok.room, sok);
   OutPackets.send_coords(sok.room, sok.room[randColor]);
}

function collectPowerupSick(sok: WebSocket) {
   const rand = Math.floor(Math.random() * 2);
   if (rand === 0) {
      sok.emit('switchKeys');
   } else {
      sok.setSick(true);
   }
}


export function tie_powerups(sok: WebSocket): void {
   sok.collectPowerup = (x: number, y: number): void => {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(sok.room.grid[y][x]))
         return;

      if (sok.room.grid[y][x] === Block.POWER_BOMBPLUS) {
         collectPowerupBombplus(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_BOMBLENGTH) {
         collectPowerupBomblength(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_SPEED) {
         collectPowerupSpeed(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_SHIELD) {
         collectPowerupShield(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_KICKBOMBS) {
         collectPowerupKickbombs(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_BOMBTIME) {
         collectPowerupBombtime(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_SWITCHPLAYER) {
         collectPowerupSwitchplayer(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_SICK) {
         collectPowerupSick(sok);
      }
      else if (sok.room.grid[y][x] === Block.POWER_BONUS) {
         const rand = Math.floor(Math.random() * 11);

         switch (rand) {
            case 0:
               collectPowerupBomblength(sok);
               break;
            case 1:
               collectPowerupBombplus(sok);
               break;
            case 2:
               collectPowerupKickbombs(sok);
               break;
            case 3:  case 4:
               collectPowerupSick(sok);
               break;
            case 5:
               collectPowerupSpeed(sok);
               break;
            case 6:
               collectPowerupShield(sok);
               break;
            case 7:
               collectPowerupBombtime(sok);
               break;
            case 8:
               collectPowerupSwitchplayer(sok);
               break;
            case 9: // BonusLOST
               sok.speed = MOVE_SPEEDS[0];
               sok.bombCount = 1;
               sok.bombTime = BOMB_TIMES[0];
               sok.bombLength = 2;
               sok.setShield(false);
               sok.kickBombs = false;
               OutPackets.send_playSound(sok.room, 'bonuslost');
               break;
            case 10: // BonusALL
               sok.speed = MOVE_SPEEDS[MOVE_SPEEDS.length - 1];
               sok.bombCount = 4;
               sok.bombTime = BOMB_TIMES[BOMB_TIMES.length - 1];
               sok.bombLength = 14;
               sok.setShield(true);
               sok.kickBombs = true;
               OutPackets.send_playSound(sok.room, 'bonusall');
               break;
         }
      }

      OutPackets.send_gridUpdate(sok.room, x, y, Block.NO);
      OutPackets.send_playSound(sok.room, 'powerup');
      sok.room.grid[y][x] = Block.NO;
   }
}