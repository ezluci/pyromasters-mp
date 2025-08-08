import { setGameTime } from "../game-variables";

export function processPacket_gameTime(packet: Uint8Array) {
   
   const time = packet[1] << 8 | packet[2];

   setGameTime(time);
}