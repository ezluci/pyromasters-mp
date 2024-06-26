'use strict';

const CONST = require('../consts')();
const TICK_ACTIONS = require('../tick_actions');


function getSpeedIndex(io, sok){
   return sok.moveSpeedIndex;
}

function setSpeedIndex(index, io, sok) {
   if ( !(0 <= index && index < CONST.MOVE_SPEEDS.length) ) {
      return;
   }
   sok.moveSpeedIndex = index;
   sok.emit('speedUpdate', CONST.MOVE_SPEEDS[index]);
}


function getShield(io, sok) {
   return sok.shield;
}

function setShieldFalse(io, sok) {
   if (sok.shield) {
      io.to(sok.roomname).emit('shield0', sok.color);
      sok.room.ticks.removeAction(TICK_ACTIONS.SHIELD_FALSE, sok.shieldFalse_lastTick, sok);
      sok.shield = false;
      sok.shieldFalse_lastTick = null;
   }
}

function setShieldTrue(io, sok) {
   if (sok.shield) {
      sok.room.ticks.removeAction(TICK_ACTIONS.SHIELD_FALSE, sok.shieldFalse_lastTick, sok);
   } else {
      io.to(sok.roomname).emit('shield1', sok.color);
      sok.shield = true;
   }

   sok.room.ticks.addAction(TICK_ACTIONS.SHIELD_FALSE, CONST.SHIELD_TIME_TICKS, sok);
   sok.shieldFalse_lastTick = sok.room.ticks.tick + CONST.SHIELD_TIME_TICKS;
}


function getSick(io, sok) {
   return sok.sick;
}

function setSickFalse(io, sok) {
   if (sok.sick) {
      io.to(sok.roomname).emit('sick0', sok.color);
      sok.room.ticks.removeAction(TICK_ACTIONS.SICK_FALSE, sok.sickFalse_lastTick, sok);
      sok.sick = false;
      sok.sickFalse_lastTick = null;
   }
}

function setSickTrue(io, sok) {
   if (sok.sick) {
      sok.room.ticks.removeAction(TICK_ACTIONS.SICK_FALSE, sok.sickFalse_lastTick, sok);
   } else {
      io.to(sok.roomname).emit('sick1', sok.color);
      sok.sick = true;
   }

   sok.room.ticks.addAction(TICK_ACTIONS.SICK_FALSE, CONST.SICK_TIME_TICKS, sok);
   sok.sickFalse_lastTick = sok.room.ticks.tick + CONST.SICK_TIME_TICKS;
}


module.exports = {
   getSpeedIndex, setSpeedIndex,
   getShield, setShieldFalse, setShieldTrue,
   getSick, setSickFalse, setSickTrue,
}