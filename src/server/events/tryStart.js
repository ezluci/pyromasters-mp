const CONST = require('../consts')();
const startGame = require('../functions/startGame').startGame;


function tryStart(io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.STARTING)
      return sok.emit('error', 'tryStart: Room is in STARTING status.');
   
   if (sok.getRoomStatus() === CONST.ROOM_STATUS.RUNNING)
      return sok.emit('error', 'tryStart: Room is in RUNNING status.');
   
   if (!sok.isOwner)
      return sok.emit('error', 'tryStart: You are not the owner of this room!');
   
   let cntSelected = 0;
   ['white', 'black', 'orange', 'green'].forEach((color) => {
      if (ROOMS.get(sok.room)[color].selected)
         cntSelected ++;
   });
   
   if (cntSelected === 0)
      return sok.emit('error', 'tryStart: You can\'t start the game with NO PLAYERS, silly!');

   sok.setRoomStatus(CONST.ROOM_STATUS.STARTING);
   
   io.to(sok.room).emit('room_status', `'${sok.username}' started the countdown. game starts in 3s`);
   const id3 = setTimeout(() => {
      io.to(sok.room).emit('room_status', `'${sok.username}' started the countdown. game starts in 2s`);
      const id2 = setTimeout(() => {
         io.to(sok.room).emit('room_status', `'${sok.username}' started the countdown. game starts in 1s`);
         const id1 = setTimeout(() => {startGame(io, ROOMS, sok);}, 1000);
         sok.intervalIDS.add(id1);
      }, 1000);
      sok.intervalIDS.add(id2);
   }, 1000);
   sok.intervalIDS.add(id3);
}

module.exports.tryStart = tryStart;