import { OutPackets } from "./out-packets";
import { Room } from "../room";
import { Block } from "../game-types";
import { WebSocket } from "ws";

const packetChar = 'g'.charCodeAt(0);

export function sendPacket_gridUpdate(this: typeof OutPackets, target: Room | WebSocket, x: number, y: number, block: Block) {
   const packet = new Uint8Array(1 + 3);

   packet[0] = packetChar;

   packet[1] = x;
   packet[2] = y;
   packet[3] = block;

   this.bufferPacket(target, packet);
}