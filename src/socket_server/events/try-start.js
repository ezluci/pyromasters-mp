'use strict';

const CONST = require('../consts');

function tryStart(mapName, io, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.STARTING)
      return sok.emit('error', 'tryStart: Room is in STARTING status.');
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING)
      return sok.emit('error', 'tryStart: Room is in RUNNING status.');
   
   if (!sok.isOwner)
      return sok.emit('error', 'tryStart: You are not the owner of this room!');

   const maps = ['bricktown', 'fourway', 'magneto'];
   if (mapName === 'random') {
      mapName = maps[Math.floor(Math.random() * maps.length)];
   }
   
   if (maps.filter((map) => mapName === map).length === 0) {
      return sok.emit('error', 'tryStart: invalid map name');
   }
   
   let cntPlayers = 0;
   ['white', 'black', 'orange', 'green'].forEach((color) => {
      if (sok.room[color]) {
         cntPlayers ++;
      }
   });
   
   if (cntPlayers === 0) {
      return sok.emit('error', 'tryStart: You can\'t start the game with NO PLAYERS, silly!');
   }

   sok.room.selectedPlayersInitial = 0;
   /// set stats for each color
   ['white', 'black', 'orange', 'green'].forEach(color => {
      if (!sok.room[color]) {
         return;
      }
      sok.room.selectedPlayersInitial ++;
      
      sok.room[color].coords = { ...CONST.DEFAULT_POS[color] };
      sok.room[color].bombs = 1;
      sok.room[color].bombTimeIndex = 0;
      sok.room[color].bombLength = 2;
      sok.room[color].dead = false;
      sok.room[color].setShieldFalse();
      sok.room[color].setSickFalse();
      sok.room[color].setSpeedIndex(0);
      sok.room[color].animState = CONST.ANIMATION.IDLE;
      io.to(sok.roomname).emit('coords', color, sok.room[color].coords, sok.room[color].animState);
   })

   sok.setMapName(mapName);
   sok.setMap( sok.generateMap() );
   sok.room.endgameBlocks = null;
   sok.room.endscreen_tickId = null;


   sok.room.ticks.startTickLoop();


   sok.room.ticks.addFunc(() => { sok.setRoomStatus(CONST.ROOM_STATUS.STARTING) }, sok.room.ticks.TPS * 0);
   sok.room.ticks.addFunc(() => { sok.setRoomStatus('starting in 3s') }, sok.room.ticks.TPS * 0);
   sok.room.ticks.addFunc(() => { sok.setRoomStatus('starting in 2s') }, sok.room.ticks.TPS * 1);
   sok.room.ticks.addFunc(() => { sok.setRoomStatus('starting in 1s') }, sok.room.ticks.TPS * 2);
   sok.room.ticks.addFunc(() => { sok.setRoomStatus(CONST.ROOM_STATUS.RUNNING) }, sok.room.ticks.TPS * 3);

   sok.room.gameTime = 120; // 2 minutes

   for (let i = 0; i < sok.room.gameTime; i++) {
      sok.room.ticks.addFunc(() => {
         sok.room.gameTime --;
         io.to(sok.roomname).emit('gameTime', sok.room.gameTime);
      }, sok.room.ticks.TPS * (3 + i));
   }
   for (let i = 0; i < CONST.BLOCKS_HORIZONTALLY * CONST.BLOCKS_VERTICALLY; i++) {
      sok.room.ticks.addFunc(sok.placeEndgameBlock, sok.room.ticks.TPS * (3 + sok.room.gameTime + 0.84 * i));
   }
}

module.exports.tryStart = tryStart;