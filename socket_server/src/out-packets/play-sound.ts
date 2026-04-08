import { WebSocket } from "ws";
import { OutPackets } from "./out-packets";
import { Room } from "../room";
import { soundNames, soundsCount } from "../socket-server";
import { logger } from "../log";

const packetChar = 'y'.charCodeAt(0);

export function sendPacket_playSound(this: typeof OutPackets, target: Room | WebSocket, soundName: string) {
   if (!Object.keys(soundsCount).includes(soundName)) {
      return logger.error(`sendPacket_playSound: error soundName=${soundName}`);
   }

   const packet = new Uint8Array(1 + 1);

   packet[0] = packetChar;

   if (soundsCount[soundName] === 1) {
      packet[1] = soundNames.indexOf(soundName);
   } else {
      packet[1] = soundNames.indexOf(soundName + '_' + Math.floor(Math.random() * soundsCount[soundName] + 1).toString().padStart(2, '0'));
   }

   this.bufferPacket(target, packet);
}