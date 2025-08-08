import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";
import { Color } from "../game-types";

const packetChar = 'd'.charCodeAt(0);

export function sendPacket_endScreen(this: typeof OutPackets, target: Room | WebSocket, winner: Color | null) {
   const packet = new Uint8Array(1 + 1);

   packet[0] = packetChar;

   packet[1] = (winner === null ? 0 : Object.values(Color).indexOf(winner) + 1);

   this.bufferPacket(target, packet);
}