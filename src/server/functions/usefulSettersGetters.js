'use strict';

const CONST = require('../consts')();


function getSpeedIndex(io, ROOMS, sok){
   return ROOMS.get(sok.room)[sok.color].moveSpeedIndex;
}

function setSpeedIndex(index, io, ROOMS, sok) {
   if ( !(0 <= index && index < CONST.MOVE_SPEEDS.length) ) {
      return console.log('setSpeedIndex invalid index');
   }
   ROOMS.get(sok.room)[sok.color].moveSpeedIndex = index;
   sok.emit('speedUpdate', CONST.MOVE_SPEEDS[index]);
}


function getShield(io, ROOMS, sok) {
   return ROOMS.get(sok.room)[sok.color].shield;
}

function setShield0(io, ROOMS, sok) {
   const plr = ROOMS.get(sok.room)[sok.color];
   if (plr.shieldTimeout) {
      clearTimeout(plr.shieldTimeout);
   }

   io.to(sok.room).emit('shield0', sok.color);
   plr.shield = false;
}

function setShield1(io, ROOMS, sok) {
   const plr = ROOMS.get(sok.room)[sok.color];
   if (plr.shieldTimeout) {
      clearTimeout(plr.shieldTimeout);
   }

   io.to(sok.room).emit('shield1', sok.color);
   plr.shield = true;
   plr.shieldTimeout = setTimeout(() => {
      if (plr)
         plr.shield = false;
   }, CONST.SHIELD_TIME);
   sok.intervalIDS.add(plr.shieldTimeout);
}


module.exports = {
   getSpeedIndex, setSpeedIndex,
   getShield, setShield0, setShield1
}