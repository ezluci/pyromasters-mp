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
   sok.isOwner = !ROOMS.has(sok.roomname);
   sok.shield = 0;
   sok.shieldFalse_lastTick = null;
   sok.moveSpeedIndex = 0;
   sok.sick = false;
   sok.sickFalse_lastTick = null;
   sok.animState = 0;

   sok.join(sok.roomname)
   sok.to(sok.roomname).emit('player+', sok.username, sok.color, sok.isOwner)

   if (sok.isOwner) {
      const map = [];
      for (let i = 0; i < CONST.BLOCKS_VERTICALLY; ++i) {
         map[i] = [];
         for (let j = 0; j < CONST.BLOCKS_HORIZONTALLY; ++j) {
            if (i % 2 == 1 && j % 2 == 1)
               map[i][j] = CONST.BLOCK.PERMANENT;
            else
               map[i][j] = CONST.BLOCK.NO;
         }
      }


      ROOMS.set(sok.roomname, {
         owner: sok.username,
         white: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['white']), bombs: 0, bombTimeIndex: 0, bombLength: 2, dead: true, selected: false},
         black: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['black']), bombs: 0, bombTimeIndex: 0, bombLength: 2, dead: true, selected: false},
         orange:{sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['orange']),bombs: 0, bombTimeIndex: 0, bombLength: 2, dead: true, selected: false},
         green: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['green']), bombs: 0, bombTimeIndex: 0, bombLength: 2, dead: true, selected: false},
         map: map,
         players: new Map(),
         bombs: new Map(),
         intervalIDS: new Set(),
         gameTime: null,
         ranking: {},
         status: CONST.ROOM_STATUS.WAITING
      });
   }

   sok.room = ROOMS.get(sok.roomname);
   
   sok.map = sok.room.map;
   sok.emit('room_status', sok.getRoomStatus());
   sok.room.players.set(sok.username, {color: sok.color, isOwner: sok.isOwner, sok: sok});
   
   console.log(`connected:    ${sok.id}, {username: ${sok.username}, room: ${sok.roomname}, isOwner: ${sok.isOwner}}`)
   

   const players1 = [];
   sok.room.players.forEach(({color, isOwner}, username) => {
      players1.push({username, color, isOwner})
   });
   
   const colorsCoords = {};
   ['white', 'black', 'orange', 'green'].forEach(color => {
      colorsCoords[color] = sok.room[color].coords;
   });

   callback(players1, colorsCoords, sok.room.map, sok.getRoomStatus());
}

module.exports.playerJoined = playerJoined;