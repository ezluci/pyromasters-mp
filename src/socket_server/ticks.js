'use strict';

const CONST = require('./consts')();
const USG = require('./functions/usefulSettersGetters');
const TICK_ACTIONS = require('./tick_actions');

class Ticks {

   constructor(io, sok) {
      this.io = io;
      this.sok = sok;
      this.lastTickTime = new Date();
      this.runNextTick();
      this.intervalId = setInterval(() => {
         this.runNextTick();
      }, 16); // 62.5 ticks per second
   }


   tick = 0; // the tick to be processed
   tickActions = {};

   runNextTick = () => {
      this.tickActions[this.tick]?.forEach(action => {
         this.processAction(action);
      })

      const tickTime = new Date();
      if (tickTime - this.lastTickTime >= 16 * 2) {
         console.error(`${new Date()}  16tps loop running at ${tickTime - this.lastTickTime}tps!`);
      }
      this.lastTickTime = tickTime;
      this.tick ++;
   };


   // 'action' is formed of {'name': a number from TICK_ACTIONS and 'sok': the player for which the action is (optional)}

   processAction = (action) => {
      if (action.name === TICK_ACTIONS.SHIELD_FALSE) {
         USG.setShieldFalse(this.io, this.sok.room[action.sok.color].sok);
      } else if (action.name === TICK_ACTIONS.SICK_FALSE) {
         USG.setSickFalse(this.io, this.sok.room[action.sok.color].sok);
      }
   };

   // adds this action to 'ticks_after' ticks from now; this action is for sok (optional).
   addAction = (action, ticks_after, sok = '') => {
      if (ticks_after < 0) {
         console.error('trying to add an action to a past tick');
         return;
      }

      if (this.tickActions[this.tick + ticks_after] === undefined) {
         this.tickActions[this.tick + ticks_after] = [];
      }
      this.tickActions[this.tick + ticks_after].push({ name: action, sok: sok });
   };

   removeAction = (action, tick, sok = '') => {
      const lastLength = this.tickActions[tick]?.length;
      this.tickActions[tick] = this.tickActions[tick].filter(action1 => action1.name === action.name && action1.sok === action.sok);
      if (this.tickActions[tick] === undefined || lastLength === this.tickActions[tick].length) {
         console.error('trying to remove inexistent action');
      }
   }
};

module.exports = (io, sok) => {
   return new Ticks(io, sok);
}