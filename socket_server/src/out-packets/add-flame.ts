import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";

const packetChar = '4'.charCodeAt(0);

export function sendPacket_addFlame(this: typeof OutPackets, target: Room | WebSocket, x: number, y: number) {
   const packet = new Uint8Array(1 + 2);

   packet[0] = packetChar;

   packet[1] = x;
   packet[2] = y;

   this.bufferPacket(target, packet);
}