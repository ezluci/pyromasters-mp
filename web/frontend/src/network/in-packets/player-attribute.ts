import { Dom } from "../../dom";
import type { Game } from "../../game";
import { BOMB_TIMES, MOVE_SPEEDS } from "../../game-consts";
import { Color } from "../../types";

export function processPacket_playerAttribute(packet: Uint8Array, g: Game) {
   const color = (packet[1] === 0 ? null : Object.values(Color)[packet[1] - 1]);

   if (packet[0] === 0) {
      const isOwner: boolean = (packet[1] ? true : false);
      let userName = '';
      for (let i = 0; packet[2 + i]; ++i) {
         userName += String.fromCharCode(packet[2 + i]);
      }
      const player = g.players.get(userName);
      if (!player) {
         return console.error('processPacket_playerAttribute: username does not exist');
      }

      Dom.changePlayerIsOwner(userName, isOwner);
      player.isOwner = isOwner;
      return;
   }

   if (packet[0] === 3) {
      let userName = '';
      for (let i = 0; packet[2 + i]; ++i) {
         userName += String.fromCharCode(packet[2 + i]);
      }
      g.changePlayerColor(userName, color);
      return;
   }

   if (!color || !g.colors[color]) {
      return console.error(`processPacket_playerAttribute: color/player is null - ${color}`);
   }

   switch (packet[0]) {
      case 1:
         const wins = packet[2] << 8 | packet[3];
         g.colors[color].wins = wins;
         break;
      case 2:
         const kills = packet[2] << 8 | packet[3];
         g.colors[color].kills = kills;
         break;
      case 4:
         g.colors[color].x = (packet[2] << 8 | packet[3]) / 70;
         g.colors[color].y = (packet[4] << 8 | packet[5]) / 70;
         break;
      case 5:
         g.colors[color].dead = (packet[2] ? true : false);
         Dom.powerups[color].main.style.display = (g.colors[color].dead ? 'none' : 'flex');
         break;
      case 6:
         g.colors[color].animState = packet[2];
         break;
      case 7:
         g.colors[color].speed = MOVE_SPEEDS[packet[2]];
         Dom.powerups[color]['speed'].querySelector('span')!.innerText = (
            g.colors[color].speed === MOVE_SPEEDS[0] ? 'LOW' :
            g.colors[color].speed === MOVE_SPEEDS[1] ? 'MED' :
            g.colors[color].speed === MOVE_SPEEDS[2] ? 'HIGH' :
            'ERR'
         );
         break;
      case 8:
         g.colors[color].bombCount = packet[2];
         for (let i = 1; i <= g.colors[color].bombCount; ++i) {
            (Dom.powerups[color] as any)[`bomb${i}`].style.visibility = 'visible';
         }
         for (let i = g.colors[color].bombCount + 1; i <= 4; ++i) {
            (Dom.powerups[color] as any)[`bomb${i}`].style.visibility = 'hidden';
         }
         break;
      case 9:
         g.colors[color].bombTime = BOMB_TIMES[packet[2]];
         Dom.powerups[color]['bombtime'].querySelector('span')!.innerText = g.colors[color].bombTime / 1000 + 's';
         break;
      case 10:
         g.colors[color].bombLength = packet[2];
         Dom.powerups[color]['bomblength'].querySelector('span')!.innerText = g.colors[color].bombLength.toString();
         break;
      case 11:
         g.colors[color].shield = (packet[2] ? true : false);
         break;
      case 12:
         g.colors[color].sick = (packet[2] ? true : false);
         break;
      case 13:
         g.colors[color].kickBombs = (packet[2] ? true : false);
         Dom.powerups[color]['kickbomb'].style.visibility = (g.colors[color].kickBombs ? 'visible' : 'hidden');
         break;
      default:
         console.error(`processPacket_playerAttribute: packet ${packet[0]} unhandled`);
   }
}