'use strict';

const CONST = require('../consts')()

function selectColor(newColor, io, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() !== CONST.ROOM_STATUS.WAITING)
      return sok.emit('error', 'selectColor: Room is not in WAITING status.');
   
   if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
      return sok.emit('error', 'selectColor: invalid color.');
   
   if (newColor !== 'spectator' && sok.room[newColor] !== undefined)
      return sok.emit('error', 'selectColor: color already taken.');
   
   if (sok.color !== 'spectator') {
      sok.room[sok.color] = undefined;
   }
   
   sok.color = newColor;
   if (newColor !== 'spectator') {
      sok.room[newColor] = sok;
   }
   sok.room.players.get(sok.username).color = newColor;

   io.to(sok.roomname).emit('player~', sok.username, sok.username, sok.color, sok.isOwner);
}

module.exports.selectColor = selectColor;