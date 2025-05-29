import { Server, Socket } from "socket.io";
import { ALL_COLORS, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BOMB_TIMES, isPowerup, MOVE_SPEEDS } from "../game-consts";
import { Block, Color } from "../game-types";
import { playSound } from "../room-functions/play-sound";

function collectPowerupBombplus(sok: Socket) {
   if (sok.bombCount < 4)
      sok.bombCount ++
}

function collectPowerupBomblength(sok: Socket) {
   sok.bombLength += 2;
   if (sok.bombLength > 14) {
      sok.bombLength = 14;
   }
}

function collectPowerupSpeed(sok: Socket) {
   const index = MOVE_SPEEDS.indexOf(sok.speed);
   sok.speed = MOVE_SPEEDS[Math.min(index + 1, MOVE_SPEEDS.length - 1)];
}

function collectPowerupShield(sok: Socket) {
   sok.shield = true;
}

function collectPowerupKickbombs(sok: Socket) {
   sok.kickBombs = true;
}

function collectPowerupBombtime(sok: Socket) {
   const index = BOMB_TIMES.indexOf(sok.bombTime);
   sok.bombTime = BOMB_TIMES[Math.min(index + 1, BOMB_TIMES.length - 1)];
}

function collectPowerupSwitchplayer(sok: Socket) {
   const io: Server = sok.nsp.server;
   const otherPlayers: Color[] = [];
   ALL_COLORS.forEach(otherColor => {
      if (sok.room[otherColor] && !sok.room[otherColor].dead && otherColor !== sok.color)
         otherPlayers.push(otherColor);
   });

   if (otherPlayers.length === 0)
      return;
   
   const randIdx = Math.floor(Math.random() * otherPlayers.length);
   const randColor = otherPlayers[randIdx];
   if (!sok.room[randColor]) {
      return;
   }

   [sok.coords.x, sok.room[randColor].coords.x] = [sok.room[randColor].coords.x, sok.coords.x];
   [sok.coords.y, sok.room[randColor].coords.y] = [sok.room[randColor].coords.y, sok.coords.y];
   
   io.to(sok.room.name).emit('coords', sok.color, sok.coords);
   io.to(sok.room.name).emit('coords', randColor, sok.room[randColor].coords);
}

function collectPowerupSick(sok: Socket) {
   const rand = Math.floor(Math.random() * 2);
   if (rand === 0) {
      sok.emit('switchKeys');
   } else {
      sok.sick = true;
   }
}


export function tie_powerups(sok: Socket): void {
   const io: Server = sok.nsp.server;
   sok.collectPowerup = (x: number, y: number): void => {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(sok.room.map[y][x]))
         return;

      if (sok.room.map[y][x] === Block.POWER_BOMBPLUS) {
         collectPowerupBombplus(sok);
         io.emit('powerup-update', [{ color: sok.color, powerup: 'bombcount', value: sok.bombCount }]);
      }
      else if (sok.room.map[y][x] === Block.POWER_BOMBLENGTH) {
         collectPowerupBomblength(sok);
         io.emit('powerup-update', [{ color: sok.color, powerup: 'bomblength', value: sok.bombLength }]);
      }
      else if (sok.room.map[y][x] === Block.POWER_SPEED) {
         collectPowerupSpeed(sok);
         io.emit('powerup-update', [{ color: sok.color, powerup: 'speed', value: sok.speed }]);
      }
      else if (sok.room.map[y][x] === Block.POWER_SHIELD) {
         collectPowerupShield(sok);
      }
      else if (sok.room.map[y][x] === Block.POWER_KICKBOMBS) {
         collectPowerupKickbombs(sok);
         io.emit('powerup-update', [{ color: sok.color, powerup: 'kickbomb', value: sok.kickBombs }]);
      }
      else if (sok.room.map[y][x] === Block.POWER_BOMBTIME) {
         collectPowerupBombtime(sok);
         io.emit('powerup-update', [{ color: sok.color, powerup: 'bombtime', value: sok.bombTime }]);
      }
      else if (sok.room.map[y][x] === Block.POWER_SWITCHPLAYER) {
         collectPowerupSwitchplayer(sok);
      }
      else if (sok.room.map[y][x] === Block.POWER_SICK) {
         collectPowerupSick(sok);
      }
      else if (sok.room.map[y][x] === Block.POWER_BONUS) {
         const rand = Math.floor(Math.random() * 11);

         switch (rand) {
            case 0:
               collectPowerupBomblength(sok);
               io.emit('powerup-update', [{ color: sok.color, powerup: 'bomblength', value: sok.bombLength }]);
               break;
            case 1:
               collectPowerupBombplus(sok);
               io.emit('powerup-update', [{ color: sok.color, powerup: 'bombcount', value: sok.bombCount }]);
               break;
            case 2:
               collectPowerupKickbombs(sok);
               io.emit('powerup-update', [{ color: sok.color, powerup: 'kickbomb', value: sok.kickBombs }]);
               break;
            case 3:  case 4:
               collectPowerupSick(sok);
               break;
            case 5:
               collectPowerupSpeed(sok);
               io.emit('powerup-update', [{ color: sok.color, powerup: 'speed', value: sok.speed }]);
               break;
            case 6:
               collectPowerupShield(sok);
               break;
            case 7:
               collectPowerupBombtime(sok);
               io.emit('powerup-update', [{ color: sok.color, powerup: 'bombtime', value: sok.bombTime }]);
               break;
            case 8:
               collectPowerupSwitchplayer(sok);
               break;
            case 9: // BonusLOST
               sok.speed = MOVE_SPEEDS[0];
               sok.bombCount = 1;
               sok.bombTime = BOMB_TIMES[0];
               sok.bombLength = 2;
               sok.shield = false;
               sok.kickBombs = false;
               playSound(sok.room, 'bonuslost');
               io.emit('powerup-update', [
                  { color: sok.color, powerup: 'bombcount', value: sok.bombCount },
                  { color: sok.color, powerup: 'bomblength', value: sok.bombLength },
                  { color: sok.color, powerup: 'speed', value: sok.speed },
                  { color: sok.color, powerup: 'kickbomb', value: sok.kickBombs },
                  { color: sok.color, powerup: 'bombtime', value: sok.bombTime }
               ]);
               break;
            case 10: // BonusALL
               sok.speed = MOVE_SPEEDS[MOVE_SPEEDS.length - 1];
               sok.bombCount = 4;
               sok.bombTime = BOMB_TIMES[BOMB_TIMES.length - 1];
               sok.bombLength = 14;
               sok.shield = true;
               sok.kickBombs = true;
               playSound(sok.room, 'bonusall');
               io.emit('powerup-update', [
                  { color: sok.color, powerup: 'bombcount', value: sok.bombCount },
                  { color: sok.color, powerup: 'bomblength', value: sok.bombLength },
                  { color: sok.color, powerup: 'speed', value: sok.speed },
                  { color: sok.color, powerup: 'kickbomb', value: sok.kickBombs },
                  { color: sok.color, powerup: 'bombtime', value: sok.bombTime }
               ]);
               break;
         }
      }

      io.to(sok.room.name).emit('mapUpdates', [{x, y, block: Block.NO}]);
      playSound(sok.room, 'powerup');
      sok.room.map[y][x] = Block.NO;
   }
}