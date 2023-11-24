const CONST = require('../consts')()

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
   if (newColor !== 'spectator') {
      ROOMS.get(sok.room)[newColor] = {username: sok.username, coords: Object.assign(CONST.DEFAULT_POS[newColor]), bombs: 1, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: false, shield: false, selected: true};
      io.to(sok.room).emit('coords', newColor, Object.assign(CONST.DEFAULT_POS[newColor]));
   }
   ROOMS.get(sok.room).players.get(sok.username).color = newColor;

   sok.color = newColor;
   io.to(sok.room).emit('player~', sok.username, sok.username, sok.color, sok.isOwner);
}

module.exports.selectColor = selectColor;