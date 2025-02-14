import { Socket } from "socket.io";

// !! the tick loop is not started on object construction


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

export class Ticks {
   sok: Socket;
   
   TPS: number; // ticks per second
   MSPT: number; // ms per tick
   runEveryTick: Function | null; // a function that will run on every tick
   
   tick: number; // the tick to be processed
   tickIds: number[][]; // tickIds[tick] = [the funcIds to be processed]
   funcIdCounter: number;
   funcs: { func: Function, tick: number }[]; // funcs[id] = {func, tick}
   
   tickLoopIntervalId: ReturnType<typeof setTimeout> | null;

   
   constructor(sok: Socket, runEveryTick: Function | null) {
      this.sok = sok;

      this.TPS = 62.5;
      this.MSPT = Math.round(1000 / this.TPS);
      this.runEveryTick = runEveryTick;
      
      this.tick = 0;
      this.tickIds = [];
      this.funcIdCounter = 0;
      this.funcs = [];
      
      this.tickLoopIntervalId = null;
   }

   startTickLoop() {
      if (this.tickLoopIntervalId) {
         console.warn('tick loop already started, ignoring request');
         return;
      }

      this.tick = 0;
      this.tickIds = [];
      this.funcIdCounter = 0;
      this.funcs = [];

      this.processCurrentTick();
      this.tickLoopIntervalId = setInterval(this.processCurrentTick, this.MSPT);
   }

   endTickLoop() {
      if (this.tickLoopIntervalId === null) {
         return console.warn('tick loop already ended, ignoring request');
      }
      
      clearInterval(this.tickLoopIntervalId);
      this.tickLoopIntervalId = null;
   }

   processCurrentTick = () => {
      this.tickIds[this.tick]?.forEach(funcId => this.funcs[funcId].func());

      if (this.runEveryTick) {
         this.runEveryTick();
      }
      
      this.tick ++;
   };

   addFunc = (func: Function, ticks_after: number): number | undefined => {
      if (!this.tickLoopIntervalId) {
         console.warn('addfunc on ended tickloop');
         return undefined;
      }
      if (ticks_after < 0) {
         console.error('trying to add a function to a past tick');
         return undefined;
      }
      
      ticks_after = Math.round(ticks_after);
      const newTick: number = this.tick + ticks_after;
      const funcId: number = this.funcIdCounter;
      this.funcs[funcId] = { func: func, tick: newTick };
      
      if (this.tickIds[newTick] === undefined) {
         this.tickIds[newTick] = [];
      }
      this.tickIds[newTick].push(funcId);
      
      this.funcIdCounter ++;
      return funcId;
   };

   removeFunc = (funcId: number) => {
      if (!this.tickLoopIntervalId) {
         return console.warn('removefunc on ended tickloop');
      }
      const tick: number = this.funcs[funcId].tick;
      if (this.tickIds[tick] === undefined) {
         return console.error('trying to remove an inexistent funcId');
      }

      const index: number = this.tickIds[tick].indexOf(funcId);
      if (index !== -1) {
         this.tickIds[tick].splice(index, 1);
      } else {
         return console.error('trying to remove an inexistent funcId');
      }
   }
};