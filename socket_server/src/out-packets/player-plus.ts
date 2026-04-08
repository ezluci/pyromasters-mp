import { WebSocket } from "ws";
import { Room } from "../room";
import { OutPackets } from "./out-packets";

const packetChar = '+'.charCodeAt(0);

export function sendPacket_playerPlus(this: typeof OutPackets, target: Room | WebSocket, sok: WebSocket) {
  const packet = new Uint8Array(1 + 4 + sok.name.length);

  packet[0] = packetChar;

  packet[1] = sok.id >>> 24;
  packet[2] = sok.id >>> 16;
  packet[3] = sok.id >>> 8;
  packet[4] = sok.id;

  for (let i = 0; i < sok.name.length; ++i) {
    packet[5 + i] = sok.name[i].charCodeAt(0);
  }

  this.bufferPacket(target, packet);
}