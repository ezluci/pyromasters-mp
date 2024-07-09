'use strict';

const CONST = require('../consts')();

// speed, shield, sick

module.exports = (io, sok) => {

   sok.getSpeedIndex = () => {
      return sok.moveSpeedIndex;
   }

   sok.setSpeedIndex = (index) => {
      if ( !(0 <= index && index < CONST.MOVE_SPEEDS.length) ) {
         return;
      }
      sok.moveSpeedIndex = index;
      sok.emit('speedUpdate', CONST.MOVE_SPEEDS[index]);
   }


   sok.getShield = () => {
      return sok.shield;
   }

   sok.setShieldFalse = () => {
      if (sok.shield) {
         io.to(sok.roomname).emit('shield', sok.color, false);
         sok.room.ticks.removeFunc(sok.setShieldFalse, sok.shieldFalse_lastTick);
         sok.shield = false;
         sok.shieldFalse_lastTick = null;
      }
   }

   sok.setShieldTrue = () => {
      if (sok.shield) {
         sok.room.ticks.removeFunc(sok.setShieldFalse, sok.shieldFalse_lastTick);
      } else {
         io.to(sok.roomname).emit('shield', sok.color, true);
         sok.shield = true;
      }

      sok.room.ticks.addFunc(sok.setShieldFalse, CONST.SHIELD_TIME_TICKS);
      sok.shieldFalse_lastTick = sok.room.ticks.tick + CONST.SHIELD_TIME_TICKS;
   }


   sok.getSick = () => {
      return sok.sick;
   }

   sok.setSickFalse = () => {
      if (sok.sick) {
         io.to(sok.roomname).emit('sick0', sok.color);
         sok.room.ticks.removeFunc(sok.setSickFalse, sok.sickFalse_lastTick);
         sok.sick = false;
         sok.sickFalse_lastTick = null;
      }
   }

   sok.setSickTrue = () => {
      if (sok.sick) {
         sok.room.ticks.removeFunc(sok.setSickFalse, sok.sickFalse_lastTick);
      } else {
         io.to(sok.roomname).emit('sick1', sok.color);
         sok.sick = true;
      }

      sok.room.ticks.addFunc(sok.setSickFalse, CONST.SICK_TIME_TICKS);
      sok.sickFalse_lastTick = sok.room.ticks.tick + CONST.SICK_TIME_TICKS;
   }
};