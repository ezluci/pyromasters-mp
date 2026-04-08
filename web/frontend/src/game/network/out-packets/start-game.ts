import { Game } from "../../game";
import { Map } from "../../types";

const packetChar = 'G'.charCodeAt(0);

export function sendPacket_startGame(g: Game, map: Map) {
   const packet = new Uint8Array(2);

   packet[0] = packetChar;

   packet[1] = Object.values(Map).indexOf(map);
   
   g.network.server.send(packet);
}