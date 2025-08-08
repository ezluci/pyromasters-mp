import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";
import { Color } from "../game-types";

const packetChar = 'x'.charCodeAt(0);

export function sendPacket_death(this: typeof OutPackets, target: Room | WebSocket, color: Color) {
   const packet = new Uint8Array(1 + 1);

   packet[0] = packetChar;

   packet[1] = Object.values(Color).indexOf(color);

   this.bufferPacket(target, packet);
}