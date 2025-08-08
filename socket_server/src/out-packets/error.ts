import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";

const packetChar = 'e'.charCodeAt(0);

export function sendPacket_error(this: typeof OutPackets, target: Room | WebSocket, message: string) {
   const packet = new Uint8Array(1 + message.length);

   packet[0] = packetChar;

   for (let i = 0; i < message.length; ++i) {
      packet[1 + i] = message.charCodeAt(i);
   }

   this.bufferPacket(target, packet);
}