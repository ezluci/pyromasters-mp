import { WebSocket } from "ws";
import { Room } from "../room";
import { OutPackets } from "./out-packets";

const packetChar = '+'.charCodeAt(0);

export function sendPacket_playerPlus(this: typeof OutPackets, target: Room | WebSocket, name: string) {
   const packet = new Uint8Array(1 + name.length);

   packet[0] = packetChar;

   for (let i = 0; i < name.length; ++i) {
      packet[1 + i] = name[i].charCodeAt(0);
   }

   this.bufferPacket(target, packet);
}