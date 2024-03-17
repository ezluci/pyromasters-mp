'use strict';

const CONST = require('../consts')()

const { getSpeedIndex, setSpeedIndex, getShield, setShield0, setShield1 } = require('../functions/usefulSettersGetters');

function selectColor(newColor, io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;
   
   if (sok.getRoomStatus() !== CONST.ROOM_STATUS.WAITING)
      return sok.emit('error', 'selectColor: Room is not in WAITING status.');
   
   if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
      return sok.emit('error', 'selectColor: invalid color.');
   
   if (newColor !== 'spectator' && ROOMS.get(sok.room)[newColor].selected)
      return sok.emit('error', 'selectColor: color already taken.');
   
   if (sok.color !== 'spectator') {
      ROOMS.get(sok.room)[sok.color].coords = Object.assign(CONST.DEFAULT_POS[sok.color]);
      ROOMS.get(sok.room)[sok.color].selected = false;
      ROOMS.get(sok.room)[sok.color].dead = true;
      io.to(sok.room).emit('coords', sok.color, Object.assign(CONST.DEFAULT_POS[sok.color]));
   }
   
   sok.color = newColor;
   if (newColor !== 'spectator') {
      ROOMS.get(sok.room)[newColor] = {sok: sok, coords: Object.assign(CONST.DEFAULT_POS[newColor]), bombs: 1, bombTimeIndex: 0, bombLength: 2, sick: false, dead: false, shield: false, selected: true};
      setShield0(io, ROOMS, sok);
      setSpeedIndex(0, io, ROOMS, sok);
      io.to(sok.room).emit('coords', newColor, Object.assign(CONST.DEFAULT_POS[newColor]));
   }
   ROOMS.get(sok.room).players.get(sok.username).color = newColor;

   io.to(sok.room).emit('player~', sok.username, sok.username, sok.color, sok.isOwner);
}

module.exports.selectColor = selectColor;