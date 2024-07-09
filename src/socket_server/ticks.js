'use strict';

const CONST = require('./consts')();


class Ticks {
   
   // the tick loop is not started on object construction
   constructor(io, sok) {
      this.io = io;
      this.sok = sok;
      this.TPS = 62.5;
      this.MSPT = Math.round(1000 / this.TPS); // ms per tick
      this.tick = null; // the tick to be processed
      this.tickFuncs = null;
      this.intervalId = null;
   }

   startTickLoop() {
      if (this.intervalId) {
         console.warn('tick loop already started, ignoring request');
         return;
      }

      this.tick = 0;
      this.tickFuncs = {};
      this.lastTickTime = new Date();

      this.runNextTick();
      this.intervalId = setInterval(this.runNextTick, this.MSPT);
   }

   endTickLoop() {
      if (this.intervalId === null) {
         console.warn('tick loop already ended, ignoring request');
      }
      
      clearInterval(this.intervalId);
      this.tick = null;
      this.tickFuncs = null;
      this.intervalId = null;
   }

   runNextTick = () => {
      this.tickFuncs[this.tick]?.forEach(func => func());

      // send coordinates to everyone
      const coords = [];
      ['white', 'black', 'orange', 'green'].forEach(color => {
         if (!this.sok.room[color]) {
            coords.push([CONST.INEXISTENT_POS.x, CONST.INEXISTENT_POS.y, CONST.ANIMATION.IDLE]);
         } else {
            coords.push([this.sok.room[color].coords.x, this.sok.room[color].coords.y, this.sok.room[color].animState]);
         }
      });
      this.io.to(this.sok.roomname).emit('C', coords);

      const tickTime = new Date();
      this.lastTickTime = tickTime;
      this.tick ++;
   };

   addFunc = (func, ticks_after) => {
      if (!this.tickFuncs) {
         return;
      }
      if (ticks_after < 0) {
         console.error('trying to add a function to a past tick');
         return;
      }
      ticks_after = Math.round(ticks_after);

      if (this.tickFuncs[this.tick + ticks_after] === undefined) {
         this.tickFuncs[this.tick + ticks_after] = [];
      }
      this.tickFuncs[this.tick + ticks_after].push(func);
   };

   removeFunc = (func, tick) => {
      if (!this.tickFuncs) {
         return;
      }
      tick = Math.round(tick);
      if (this.tickFuncs[tick] === undefined) {
         console.error('trying to remove an inexistent func');
      }

      const lastLength = this.tickFuncs[tick].length;
      this.tickFuncs[tick] = this.tickFuncs[tick].filter(func1 => func !== func1);

      if (lastLength === this.tickFuncs[tick].length) {
         console.error('trying to remove an inexistent func');
      }
   }
};

module.exports = (io, sok) => {
   return new Ticks(io, sok);
}