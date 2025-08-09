import { timeBitmask, unresolvedPings } from "../game-socket";
import { pingElm } from "../page";

export function processPacket_pong(packet: Uint8Array) {
   if ((window as any).testnopong)  return;
   
   const time = packet[1] << 16 | packet[2] << 8 | packet[3];

   const index = unresolvedPings.indexOf(time);
   if (index === -1) {
      return;
   }
   unresolvedPings.splice(0, index + 1);

   const ping = (performance.now() - time) & timeBitmask;
   pingElm.innerText = `ping: ${ping}`;
}