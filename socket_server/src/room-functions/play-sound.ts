import { sounds } from '../socket-server';
import { Room } from "../room";
import { Socket } from 'socket.io';

export function playSound(room: Room, soundName: string): void {
   if (!Object.keys(sounds).includes(soundName)) {
      return console.error(`playSound error: soundName=${soundName}`);
   }

   if (sounds[soundName] === 1) {
      room.io.to(room.name).emit('playsound', soundName);
   } else {
      room.io.to(room.name).emit('playsound', soundName + '_' + Math.floor(Math.random() * sounds[soundName] + 1).toString().padStart(2, '0'));
   }
}

export function playSoundSok(sok: Socket, soundName: string): void {
   if (!Object.keys(sounds).includes(soundName)) {
      return console.error(`playSound error: soundName=${soundName}`);
   }

   if (sounds[soundName] === 1) {
      sok.emit('playsound', soundName);
   } else {
      sok.emit('playsound', soundName + '_' + Math.floor(Math.random() * sounds[soundName] + 1).toString().padStart(2, '0'));
   }
}