'use strict';

const CONST = require('../consts')()

function playerJoined(username, roomname, callback, io, ROOMS, sok) {
   
   if (! /^[ -~]+$/i.test(username)) {
      sok.emit('error', 'playerJoined: invalid username. DISCONNECTED.');
      sok.disconnect();
      return;
   }
   if (! /^[ -~]+$/i.test(roomname)) {
      sok.emit('error', 'playerJoined: invalid room. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   if (ROOMS.has(roomname) && ROOMS.get(roomname).players.has(username)) {
      sok.emit('error', 'playerJoined: A player with the same name already exists in this room. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   sok.username = username;
   sok.roomname = roomname;
   sok.color = 'spectator';
   sok.coords = { ...CONST.INEXISTENT_POS };
   sok.bombs = 0;
   sok.bombTimeIndex = 0;
   sok.bombLength = 2;
   sok.dead = false;
   sok.isOwner = !ROOMS.has(sok.roomname);
   sok.shield = false;
   sok.shieldFalse_lastTick = null;
   sok.moveSpeedIndex = 0;
   sok.sick = false;
   sok.sickFalse_lastTick = null;
   sok.animState = CONST.ANIMATION.IDLE;

   sok.join(sok.roomname)
   sok.to(sok.roomname).emit('player+', sok.username, sok.color, sok.isOwner)

   if (sok.isOwner) {
      ROOMS.set(sok.roomname, {
         owner: sok.username,
         white: null, // room[color] holds the socket object for a player
         black: null,
         orange: null,
         green: null,
         map: null,
         mapName: null,
         players: new Map(),
         bombs: new Map(),
         intervalIDS: new Set(),
         gameTime: null,
         ranking: {},
         status: CONST.ROOM_STATUS.WAITING
      });
   }

   sok.room = ROOMS.get(sok.roomname);

   if (sok.isOwner) {
      sok.room.ticks = require('../ticks')(io, sok);
   }
   
   sok.emit('room_status', sok.getRoomStatus());
   sok.room.players.set(sok.username, sok);
   
   console.log(`connected:    ${sok.id}, {username: ${sok.username}, room: ${sok.roomname}, isOwner: ${sok.isOwner}}`)
   

   const players1 = [];
   sok.room.players.forEach(({color, isOwner}, username) => {
      players1.push({username, color, isOwner})
   });

   callback(players1, sok.getMapName(), sok.getMap(), sok.getRoomStatus());
}

module.exports.playerJoined = playerJoined;