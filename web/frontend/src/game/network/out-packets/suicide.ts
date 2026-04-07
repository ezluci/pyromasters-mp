import type { Game } from "../..";

const packetChar = 'Q'.charCodeAt(0);

export function sendPacket_suicide(g: Game) {
   const packet = new Uint8Array(1);

   packet[0] = packetChar;
   
   g.network.server.send(packet);
}