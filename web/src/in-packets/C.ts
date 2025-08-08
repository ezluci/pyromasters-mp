import { Animation, Color } from "../game-types";
import { colors, myPlayer } from "../game-variables";

export function processPacket_C(packet: Uint8Array) {
   let idx = 1;
   Object.values(Color).forEach(color => {
      const x = (packet[idx] << 16 | packet[idx+1] << 8 | packet[idx+2]) * 1e-4;
      idx += 3;
      
      const y = (packet[idx] << 16 | packet[idx+1] << 8 | packet[idx+2]) * 1e-4;
      idx += 3;

      const anim: Animation = packet[idx];
      idx += 1;

      if (color !== myPlayer.color && colors[color]) {
         colors[color].coords.x = x;
         colors[color].coords.y = y;
         colors[color].animState = anim;
      }
   });
}