import type { Game } from "../..";

const packetChar = 'B'.charCodeAt(0);

export function sendPacket_placeBomb(g: Game) {
   const packet = new Uint8Array(1);

   packet[0] = packetChar;
   
   g.network.server.send(packet);
}