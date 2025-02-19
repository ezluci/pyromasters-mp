import { Server, Socket } from "socket.io";
import { Animation, Color, RoomStatus } from "./game-types";
import { Room } from "./room";
import { ALL_COLORS } from "./game-consts";
import { playSoundSok } from "./room-functions/play-sound";

export function playerJoined(userName: unknown, roomName: unknown, rooms: Map<string, Room>, sok: Socket): void {
   
   if (typeof userName !== 'string' || typeof roomName !== 'string') {
      sok.emit('error', 'playerJoined: invalid data. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   if (! /^[ -~]{1,15}$/.test(userName)) {
      sok.emit('error', 'playerJoined: invalid username. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   roomName = roomName.toLowerCase();
   if (typeof roomName !== 'string') {
      return;
   }
   
   if (! /^[ -~]{1,15}$/.test(roomName)) {
      sok.emit('error', 'playerJoined: invalid room name. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   if (rooms.has(roomName) && rooms.get(roomName)?.players.has(userName)) {
      sok.emit('error', 'playerJoined: A player with the same name is already in this room. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   sok.name = userName;
   sok.isOwner = !rooms.has(roomName);

   sok.wins = 0;
   sok.kills = 0;

   sok.color = null;
   sok.coords = {x: 0, y: 0};
   sok.dead = false;
   sok.animState = Animation.IDLE_FRONT;

   sok.speed = 0;
   sok.bombCount = 0;
   sok.bombTime = 0;
   sok.bombLength = 0;
   
   sok.shield = false;
   sok.shieldFalse_tickId = 0;

   sok.sick = false;
   sok.sickFalse_tickId = 0;
   
   sok.kickBombs = false;

   sok.join(roomName)
   sok.to(roomName).emit('player+', sok.name, sok.color, sok.isOwner);

   if (sok.isOwner) {
      rooms.set(roomName, new Room(roomName, sok));
   }

   const room = rooms.get(roomName);
   if (room) {
      sok.room = room;
   } else {
      return console.error('player-joined error');
   }
   
   sok.emit('room_status', sok.room.status);
   sok.room.players.set(sok.name, sok);
   
   console.log(`connected:    ${sok.id}, {username: ${sok.name}, room: ${sok.room.name}, isOwner: ${sok.isOwner}}`)
   

   const players: { name: string, color: Color | null, isOwner: boolean }[] = [];

   sok.room.players.forEach(({color: color1, isOwner: isOwner1}, name1) => {
      players.push({name: name1, color: color1, isOwner: isOwner1});
   });

   const playersAlive: Color[] = [];
   ALL_COLORS.forEach(color => {
      if (sok.room[color] && !sok.room[color].dead) {
         playersAlive.push(color);
      }
   });

   sok.emit('initial_info', players, sok.room.mapName, sok.room.map, sok.room.status, playersAlive);
   if (sok.room.status !== RoomStatus.RUNNING) {
      playSoundSok(sok, 'menu');
   }
}