'use strict';

const CONST = require('../consts')()

const USG = require('../functions/usefulSettersGetters');

function selectColor(newColor, io, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() !== CONST.ROOM_STATUS.WAITING)
      return sok.emit('error', 'selectColor: Room is not in WAITING status.');
   
   if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
      return sok.emit('error', 'selectColor: invalid color.');
   
   if (newColor !== 'spectator' && sok.room[newColor].selected)
      return sok.emit('error', 'selectColor: color already taken.');
   
   if (sok.color !== 'spectator') {
      sok.room[sok.color].coords = Object.assign(CONST.DEFAULT_POS[sok.color]);
      sok.room[sok.color].selected = false;
      sok.room[sok.color].dead = true;
      io.to(sok.roomname).emit('coords', sok.color, Object.assign(CONST.DEFAULT_POS[sok.color]));
   }
   
   sok.color = newColor;
   if (newColor !== 'spectator') {
      sok.room[newColor] = {sok: sok, coords: Object.assign(CONST.DEFAULT_POS[newColor]), bombs: 1, bombTimeIndex: 0, bombLength: 2, dead: false, selected: true};
      USG.setShieldFalse(io, sok);
      USG.setSpeedIndex(0, io, sok);
      USG.setSickFalse(io, sok);
      io.to(sok.roomname).emit('coords', newColor, Object.assign(CONST.DEFAULT_POS[newColor]));
   }
   sok.room.players.get(sok.username).color = newColor;

   io.to(sok.roomname).emit('player~', sok.username, sok.username, sok.color, sok.isOwner);
}

module.exports.selectColor = selectColor;