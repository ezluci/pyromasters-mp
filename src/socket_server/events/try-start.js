'use strict';

const CONST = require('../consts')();
const startGame = require('../functions/start-game').startGame;

function tryStart(io, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.STARTING)
      return sok.emit('error', 'tryStart: Room is in STARTING status.');
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING)
      return sok.emit('error', 'tryStart: Room is in RUNNING status.');
   
   if (!sok.isOwner)
      return sok.emit('error', 'tryStart: You are not the owner of this room!');
   
   let cntPlayers = 0;
   ['white', 'black', 'orange', 'green'].forEach((color) => {
      if (sok.room[color]) {
         cntPlayers ++;
      }
   });
   
   if (cntPlayers === 0)
      return sok.emit('error', 'tryStart: You can\'t start the game with NO PLAYERS, silly!');
   else if (cntPlayers === 1) {
      sok.emit('error', 'btw this game should be played in >2 players...');
   }


   /// set stats for each color
   ['white', 'black', 'orange', 'green'].forEach(color => {
      if (!sok.room[color]) {
         return;
      }
      sok.room[color].coords = { ...CONST.DEFAULT_POS[color] };
      sok.room[color].bombs = 1;
      sok.room[color].bombTimeIndex = 0;
      sok.room[color].bombLength = 2;
      sok.room[color].dead = false;
      sok.room[color].setShieldFalse();
      sok.room[color].setSpeedIndex(0);
      sok.room[color].setSickFalse();
      sok.room[color].sickFalse_lastTick = null;
      sok.room[color].animState = CONST.ANIMATION.IDLE;
      io.to(sok.roomname).emit('coords', color, sok.room[color].coords, sok.room[color].animState);
   })
   


   sok.room.bombs.clear();
   sok.room.intervalIDS.forEach(id => { clearInterval(id) });
   sok.room.intervalIDS.clear();

   sok.setRoomStatus(CONST.ROOM_STATUS.STARTING);

   io.to(sok.roomname).emit('room_status', 'starting in 3s');
   const id3 = setTimeout(() => {
      io.to(sok.roomname).emit('room_status', 'starting in 2s');
      const id2 = setTimeout(() => {
         io.to(sok.roomname).emit('room_status', 'starting in 1s');
         const id1 = setTimeout(() => {startGame(io, sok);}, 1000);
         sok.room.intervalIDS.add(id1);
      }, 1000);
      sok.room.intervalIDS.add(id2);
   }, 1000);
   sok.room.intervalIDS.add(id3);
}

module.exports.tryStart = tryStart;