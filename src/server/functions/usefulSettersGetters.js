'use strict';

const CONST = require('../consts')();


function getSpeedIndex(io, ROOMS, sok){
   return sok.moveSpeedIndex;
}

function setSpeedIndex(index, io, ROOMS, sok) {
   if ( !(0 <= index && index < CONST.MOVE_SPEEDS.length) ) {
      return;
   }
   sok.moveSpeedIndex = index;
   sok.emit('speedUpdate', CONST.MOVE_SPEEDS[index]);
}


function getShield(io, ROOMS, sok) {
   return sok.shield;
}

function setShield0(io, ROOMS, sok) {
   if (sok.shieldTimeout) {
      clearTimeout(sok.shieldTimeout);
   }
   sok.shieldTimeout = null;

   io.to(sok.room).emit('shield0', sok.color);
   sok.shield = false;
}

function setShield1(io, ROOMS, sok) {
   if (sok.shieldTimeout) {
      clearTimeout(sok.shieldTimeout);
   }
   sok.shieldTimeout = setTimeout(() => {
      if (sok)
         setShield0(io, ROOMS, sok);
   }, CONST.SHIELD_TIME);

   io.to(sok.room).emit('shield1', sok.color);
   sok.shield = true;
   
   ROOMS.get(sok.room).intervalIDS.add(sok.shieldTimeout);
}


module.exports = {
   getSpeedIndex, setSpeedIndex,
   getShield, setShield0, setShield1
}