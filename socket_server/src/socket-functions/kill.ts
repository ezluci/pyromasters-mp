import { WebSocket } from "ws";
import { Color } from "../game-types";
import { OutPackets } from "../out-packets/out-packets";

export function tie_kill(sok: WebSocket): void {
   sok.kill = (assists: Color[]) => {
      if (sok.dead || !sok.color) {
         return;
      }

      sok.room.countPlayersAlive --;
      OutPackets.send_death(sok.room, sok.color);
      OutPackets.send_playSound(sok.room, 'dead');

      sok.dead = true;

      assists.forEach(assistColor => {
         if (assistColor !== sok.color) { // don't count own death
            if (sok.room[assistColor]) {
               sok.room[assistColor].kills ++;
            }
         }
      });
   }
};