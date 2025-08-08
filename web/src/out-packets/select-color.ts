import { server } from "../game-socket";
import { Color } from "../game-types";

const packetChar = 'O'.charCodeAt(0);

export function sendPacket_selectColor(color: Color | null) {
   const packet = new Uint8Array(2);

   packet[0] = packetChar;
   
   if (color === null) {
      packet[1] = 0;
   } else {
      packet[1] = 1 + Object.values(Color).indexOf(color);
   }
   
   server.send(packet);
}