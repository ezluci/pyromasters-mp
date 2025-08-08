import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";

const packetChar = 'c'.charCodeAt(0);

export function sendPacket_chat(this: typeof OutPackets, target: Room | WebSocket, sender: WebSocket, message: string) {
   const packet = new Uint8Array(1 + sender.name.length + 1 + message.length);

   packet[0] = packetChar;

   for (let i = 0; i < sender.name.length; ++i) {
      packet[1 + i] = sender.name.charCodeAt(i);
   }

   packet[1 + sender.name.length] = 0;

   for (let i = 0; i < message.length; ++i) {
      packet[2 + sender.name.length + i] = message[i].charCodeAt(0);
   }

   this.bufferPacket(target, packet);
}