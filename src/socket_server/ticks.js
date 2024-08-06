'use strict';

const CONST = require('./consts');

/*
 breakdown of the tick class:
 
 the tick loop is started on game start, and ended on game end (when the end screen is shown).
 
 you use addFunc to add a function that's gonna run at a certain tick in the future.
 this addFunc will return an id. this id is useful for when you want to REMOVE this
 function from the tick 'queue' (tickFuncs array).
 
 for example, you added a function that's gonna explode a specific bomb after 200 ticks.
 but what if that bomb explodes before that tick, from other causes? then you remove the
 initial function, so the bomb does not explode twice.
 
 tbh this tick class is complicated to use, but i hope it won't need any more
 modifications from now on.
*/

class Ticks {
   
   // the tick loop is not started on object construction
   constructor(io, sok) {
      this.io = io;
      this.sok = sok;
      this.TPS = 62.5;
      this.MSPT = Math.round(1000 / this.TPS); // ms per tick
      
      this.tick = null; // the tick to be processed
      this.tickIds = null; // tickIds[tick] = [the funcIds to be processed]
      this.funcIdCounter = null;
      this.funcs = null; // funcs[id] = {func, tick}
      
      this.tickLoopIntervalId = null;
   }

   startTickLoop() {
      if (this.tickLoopIntervalId) {
         console.warn('tick loop already started, ignoring request');
         return;
      }

      this.tick = 0;
      this.tickIds = {};
      this.funcIdCounter = 0;
      this.funcs = {};
      
      this.lastTickTime = new Date();

      this.runNextTick();
      this.tickLoopIntervalId = setInterval(this.runNextTick, this.MSPT);
   }

   endTickLoop() {
      if (this.tickLoopIntervalId === null) {
         console.warn('tick loop already ended, ignoring request');
      }
      
      clearInterval(this.tickLoopIntervalId);
      this.tick = null;
      this.tickIds = null;
      this.funcIdCounter = null;
      this.funcs = null;
      this.tickLoopIntervalId = null;
   }

   runNextTick = () => {
      this.tickIds[this.tick]?.forEach(funcId => this.funcs[funcId].func());

      this.sok.runEveryTick();
      
      // console.log(new Date() - this.lastTickTime);
      this.lastTickTime = new Date();
      this.tick ++;
   };

   addFunc = (func, ticks_after) => {
      if (ticks_after < 0) {
         console.error('trying to add a function to a past tick');
         return;
      }
      
      ticks_after = Math.round(ticks_after);
      const newTick = this.tick + ticks_after;
      const funcId = this.funcIdCounter;
      this.funcs[funcId] = { func: func, tick: newTick };
      
      if (this.tickIds[newTick] === undefined) {
         this.tickIds[newTick] = [];
      }
      this.tickIds[newTick].push(funcId);
      
      this.funcIdCounter ++;
      return funcId;
   };

   removeFunc = (funcId) => {
      const tick = this.funcs[funcId].tick;
      if (this.tickIds[tick] === undefined) {
         console.error('trying to remove an inexistent funcId');
      }

      const lastLength = this.tickIds[tick].length;
      const index = this.tickIds[tick].indexOf(funcId);
      if (index !== -1) {
         this.tickIds[tick].splice(index, 1);
      } else {
         console.error('trying to remove an inexistent funcId');
      }
   }
};


module.exports = (io, sok) => {
   return new Ticks(io, sok);
}