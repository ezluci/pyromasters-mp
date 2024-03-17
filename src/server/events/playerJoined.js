'use strict';

const CONST = require('../consts')()

function playerJoined(username, room, callback, io, ROOMS, sok) {
   
   if (!username) {
      sok.emit('error', 'playerJoined: invalid username. DISCONNECTED.');
      sok.disconnect();
      return;
   }
   if (!room) {
      sok.emit('error', 'playerJoined: invalid room. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   if (ROOMS.has(room) && ROOMS.get(room).players.has(username)) {
      sok.emit('error', 'playerJoined: A player with the same name already exists in this room. DISCONNECTED.');
      sok.disconnect();
      return;
   }

   sok.username = username;
   sok.room = room;
   sok.color = 'spectator';
   sok.isOwner = !ROOMS.has(sok.room);
   sok.shield = false;
   sok.shieldTimeout = null;
   sok.moveSpeedIndex = 0;

   sok.join(sok.room)
   sok.to(sok.room).emit('player+', sok.username, sok.color, sok.isOwner)

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


      ROOMS.set(sok.room, {
         owner: sok.username,
         white: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['white']), bombs: 0, bombTimeIndex: 0, bombLength: 2, sick: false, dead: true, selected: false},
         black: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['black']), bombs: 0, bombTimeIndex: 0, bombLength: 2, sick: false, dead: true, selected: false},
         orange:{sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['orange']),bombs: 0, bombTimeIndex: 0, bombLength: 2, sick: false, dead: true, selected: false},
         green: {sok: undefined, coords: Object.assign(CONST.DEFAULT_POS['green']), bombs: 0, bombTimeIndex: 0, bombLength: 2, sick: false, dead: true, selected: false},
         map: map,
         players: new Map(),
         bombs: new Map(),
         intervalIDS: new Set(),
         gameTime: null,
         ranking: {},
         status: CONST.ROOM_STATUS.WAITING
      });
   }
   
   sok.map = ROOMS.get(room).map;
   sok.emit('room_status', sok.getRoomStatus());
   ROOMS.get(sok.room).players.set(sok.username, {color: sok.color, isOwner: sok.isOwner});
   
   console.log(`connected:    ${sok.id}, {username: ${sok.username}, room: ${sok.room}, isOwner: ${sok.isOwner}}`)
   

   const players1 = [];
   ROOMS.get(sok.room).players.forEach(({color, isOwner}, username) => {
      players1.push({username, color, isOwner})
   });
   
   const colorsCoords = {};
   ['white', 'black', 'orange', 'green'].forEach(color => {
      colorsCoords[color] = ROOMS.get(sok.room)[color].coords;
   });

   callback(players1, colorsCoords, ROOMS.get(sok.room).map, sok.getRoomStatus());
}

module.exports.playerJoined = playerJoined;