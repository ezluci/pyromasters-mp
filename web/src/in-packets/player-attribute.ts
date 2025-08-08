import { BOMB_TIMES, MOVE_SPEEDS } from "../game-consts";
import { Color } from "../game-types";
import { changePlayerColor, colors, players } from "../game-variables";
import { DOM_changePlayerIsOwner, powerupsDOM } from "../page";

export function processPacket_playerAttribute(packet: Uint8Array) {
   const color = (packet[1] === 0 ? null : Object.values(Color)[packet[1] - 1]);

   if (packet[0] === 0) {
      const isOwner: boolean = (packet[1] ? true : false);
      let userName = '';
      for (let i = 0; packet[2 + i]; ++i) {
         userName += String.fromCharCode(packet[2 + i]);
      }
      const player = players.get(userName);
      if (!player) {
         return console.error('processPacket_playerAttribute: username does not exist');
      }

      DOM_changePlayerIsOwner(userName, isOwner);
      player.isOwner = isOwner;
      return;
   }

   if (packet[0] === 3) {
      let userName = '';
      for (let i = 0; packet[2 + i]; ++i) {
         userName += String.fromCharCode(packet[2 + i]);
      }
      changePlayerColor(userName, color);
      return;
   }

   if (!color || !colors[color]) {
      return console.error(`processPacket_playerAttribute: color/player is null - ${color}`);
   }

   switch (packet[0]) {
      case 1:
         const wins = packet[2] << 8 | packet[3];
         colors[color].wins = wins;
         break;
      case 2:
         const kills = packet[2] << 8 | packet[3];
         colors[color].kills = kills;
         break;
      case 4:
         colors[color].coords.x = (packet[2] << 8 | packet[3]) / 70;
         colors[color].coords.y = (packet[4] << 8 | packet[5]) / 70;
         break;
      case 5:
         colors[color].dead = (packet[2] ? true : false);
         powerupsDOM[color].main.style.display = (colors[color].dead ? 'none' : 'flex');
         break;
      case 6:
         colors[color].animState = packet[2];
         break;
      case 7:
         colors[color].speed = MOVE_SPEEDS[packet[2]];
         powerupsDOM[color]['speed'].querySelector('span')!.innerText = (
            colors[color].speed === MOVE_SPEEDS[0] ? 'LOW' :
            colors[color].speed === MOVE_SPEEDS[1] ? 'MED' :
            colors[color].speed === MOVE_SPEEDS[2] ? 'HIGH' :
            'ERR'
         );
         break;
      case 8:
         colors[color].bombCount = packet[2];
         for (let i = 1; i <= colors[color].bombCount; ++i) {
            (powerupsDOM[color] as any)[`bomb${i}`].style.visibility = 'visible';
         }
         for (let i = colors[color].bombCount + 1; i <= 4; ++i) {
            (powerupsDOM[color] as any)[`bomb${i}`].style.visibility = 'hidden';
         }
         break;
      case 9:
         colors[color].bombTime = BOMB_TIMES[packet[2]];
         powerupsDOM[color]['bombtime'].querySelector('span')!.innerText = colors[color].bombTime / 1000 + 's';
         break;
      case 10:
         colors[color].bombLength = packet[2];
         powerupsDOM[color]['bomblength'].querySelector('span')!.innerText = colors[color].bombLength.toString();
         break;
      case 11:
         colors[color].shield = (packet[2] ? true : false);
         break;
      case 12:
         colors[color].sick = (packet[2] ? true : false);
         break;
      case 13:
         colors[color].kickBombs = (packet[2] ? true : false);
         powerupsDOM[color]['kickbomb'].style.visibility = (colors[color].kickBombs ? 'visible' : 'hidden');
         break;
      default:
         console.error(`processPacket_playerAttribute: packet ${packet[0]} unhandled`);
   }
}