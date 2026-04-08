import { Animation, Color, RoomStatus } from "./game-types";
import { Room } from "./room";
import { WebSocket } from "ws";
import { OutPackets } from "./out-packets/out-packets";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";

export function playerConnect(url: string | undefined, rooms: Map<string, Room>, sok: WebSocket): void {
   url = url?.substring(1);
   if (!url) {
      return sok.close();
   }

   const roomName = decodeURIComponent(url).toLowerCase();

   const userName = 'aa';
   
   if (! /^[ -~]{1,15}$/.test(roomName)) {
      OutPackets.send_error(sok, 'playerJoined: invalid room name. DISCONNECTED.');
      return sok.close();
   }

   if (rooms.has(roomName) && rooms.get(roomName)?.players.has(userName)) {
      OutPackets.send_error(sok, 'playerJoined: A player with the same name is already in this room. DISCONNECTED.');
      return sok.close();
   }

   sok.name = userName;
   sok.isOwner = !rooms.has(roomName);

   sok.wins = 0;
   sok.kills = 0;

   sok.color = null;
   sok.x = 0;
   sok.y = 0;
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

   if (sok.isOwner) {
      rooms.set(roomName, new Room(roomName, sok));
   }

   const room = rooms.get(roomName);
   if (room) {
      sok.room = room;
   }

   console.log(`room{${sok.room.name}} += ${sok.name}`);

   // send all the existing players to the new player
   sok.room.players.forEach(player => {
      OutPackets.send_playerPlus(sok, player.name);
      if (player.color) {
         OutPackets.send_playerAttribute(sok, player, 'color');
      }
   });

   // add the new player to the room
   sok.room.players.set(sok.name, sok);

   // send the new player to EVERYONE in the room
   OutPackets.send_playerPlus(sok.room, sok.name);

   sok.room.players.forEach(player => {
      if (player.isOwner) {
         OutPackets.send_playerAttribute(sok, player, 'isOwner');
      }
   });
   
   if (sok.room.status !== RoomStatus.RUNNING) {
      OutPackets.send_playSound(sok, 'menu');
   }

   // send ranking here.. todo
   OutPackets.send_roomStatus(sok, sok.room.status);

   // send other information about the game
   if (sok.room.status !== RoomStatus.WAITING) {
      Object.values(Color).forEach(color => {
         if (sok.room[color]) {
            const sokFrom = sok.room[color];
            // OutPackets.send_playerAttribute(sok, sokFrom, 'wins');
            // OutPackets.send_playerAttribute(sok, sokFrom, 'kills');

            OutPackets.send_playerAttribute(sok, sokFrom, 'coords');
            OutPackets.send_playerAttribute(sok, sokFrom, 'dead');
            OutPackets.send_playerAttribute(sok, sokFrom, 'animState');

            OutPackets.send_playerAttribute(sok, sokFrom, 'speed');
            OutPackets.send_playerAttribute(sok, sokFrom, 'bombCount');
            OutPackets.send_playerAttribute(sok, sokFrom, 'bombTime');
            OutPackets.send_playerAttribute(sok, sokFrom, 'bombLength');
            OutPackets.send_playerAttribute(sok, sokFrom, 'shield');
            OutPackets.send_playerAttribute(sok, sokFrom, 'sick');
            OutPackets.send_playerAttribute(sok, sokFrom, 'kickBombs');
         }
      });

      if (sok.room.map) {
         OutPackets.send_map(sok, sok.room.map);
      }
      OutPackets.send_gameTime(sok, sok.room.gameTime);

      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
            OutPackets.send_gridUpdate(sok, x, y, sok.room.grid[x][y]);
         }
      }

      sok.room.bombs.forEach(bomb => {
         OutPackets.send_addBomb(sok, bomb.x, bomb.y, bomb.id);
      });
      sok.room.flames.forEach(flame => {
         OutPackets.send_addFlame(sok, flame.x, flame.y);
      });
   }
}


export function playerDisconnect(rooms: Map<string, Room>, sok: WebSocket): void {
   if (!sok.room) {
      return;
   }
   const room = rooms.get(sok.room.name);
   if (!room || !room.players.get(sok.name)) {
      return;
   }
   console.log(`room{${sok.room.name}} -= ${sok.name}`);

   if (sok.isOwner) {
      // destroy room
      OutPackets.send_chat(sok.room, sok, 'Owner left. Room deleted.');
      
      sok.room.players.forEach(player => {
         player.close();
      });
      if (sok.room.ticks.tickLoopIntervalId) {
         sok.room.ticks.endTickLoop();
      }
      rooms.delete(sok.room.name);
   } else {
      OutPackets.send_playerMinus(sok.room, sok.name);

      if (sok.color !== null) {
         if (sok.room.status === RoomStatus.RUNNING && !sok.dead) {
            OutPackets.send_death(sok.room, sok.color);
            sok.room.countPlayersAlive --;
            OutPackets.send_playSound(sok.room, 'dead');
         }
         sok.room[sok.color] = null;
      }
      sok.close();
   }
   sok.room.players.delete(sok.name);
}