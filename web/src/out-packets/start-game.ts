import { server } from "../game-socket";
import { Map } from "../game-types";

const packetChar = 'G'.charCodeAt(0);

export function sendPacket_startGame(map: Map) {
   const packet = new Uint8Array(2);

   packet[0] = packetChar;

   packet[1] = Object.values(Map).indexOf(map);
   
   server.send(packet);
}