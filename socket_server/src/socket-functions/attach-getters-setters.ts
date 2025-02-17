import { Socket } from "socket.io";
import { BOMB_TIMES, MOVE_SPEEDS, SHIELD_TIME_TICKS, SICK_TIME_TICKS } from "../game-consts";

function getSpeed(sok: Socket): number {
   return sok._speed;
}

function setSpeed(sok: Socket, value: number): void {
   if (!MOVE_SPEEDS.includes(value)) {
      console.error(`wrong speed ${value}`);
      return;
   }
   if (value !== sok._speed) {
      sok.emit('speedUpdate', value);
   }
   sok._speed = value;
}

function getBombTime(sok: Socket): number {
   return sok._bombTime;
}

function setBombTime(sok: Socket, value: number): void {
   if (!BOMB_TIMES.includes(value)) {
      console.error(`wrong bombTime ${value}`);
      return;
   }
   sok._bombTime = value;
}


function getShield(sok: Socket) {
   return sok._shield;
}

function setShield(sok: Socket, value: boolean): void {
   if (value === false) {
      if (sok._shield) {
         sok.nsp.server.to(sok.room.name).emit('shield', sok.color, false);
         sok.room.ticks.removeFunc(sok.shieldFalse_tickId);
         sok._shield = false;
         sok.shieldFalse_tickId = 0;
      }
   } else {
      if (sok._shield) {
         sok.room.ticks.removeFunc(sok.shieldFalse_tickId);
      } else {
         sok.nsp.server.to(sok.room.name).emit('shield', sok.color, true);
         sok._shield = true;
      }
   
      const newFuncId: number | undefined = sok.room.ticks.addFunc(() => { setShield(sok, false) }, SHIELD_TIME_TICKS);
      if (typeof newFuncId === 'number') {
         sok.shieldFalse_tickId = newFuncId;
      }
   }
}


function getSick(sok: Socket): boolean {
   return sok._sick;
}

function setSick(sok: Socket, value: boolean): void {
   if (value === false) {
      if (sok._sick) {
         sok.nsp.server.to(sok.room.name).emit('sick0', sok.color);
         sok.room.ticks.removeFunc(sok.sickFalse_tickId);
         sok._sick = false;
         sok.sickFalse_tickId = 0;
      }
   } else {
      if (sok._sick) {
         sok.room.ticks.removeFunc(sok.sickFalse_tickId);
      } else {
         sok.nsp.server.to(sok.room.name).emit('sick1', sok.color);
         sok._sick = true;
      }

      const newFuncId: number | undefined = sok.room.ticks.addFunc(() => { setSick(sok, false) }, SICK_TIME_TICKS);
      if (typeof newFuncId === 'number') {
         sok.sickFalse_tickId = newFuncId;
      }
   }
}


export function attachGettersSetters(sok: Socket): void {
   sok._speed = sok.speed;
   sok._bombTime = sok.bombTime;
   sok._shield = sok.shield;
   sok._sick = sok.sick;
   
   Object.defineProperty(sok, 'speed', {
      get: function (): number {
         return getSpeed(this);
      },
      set: function (value: number): void {
         setSpeed(this, value);
      }
   });
   
   Object.defineProperty(sok, 'bombTime', {
      get: function (): number {
         return getBombTime(this);
      },
      set: function (value: number): void {
         setBombTime(this, value);
      }
   });
   
   Object.defineProperty(sok, 'shield', {
      get: function (): boolean {
         return getShield(this);
      },
      set: function (value: boolean): void {
         setShield(this, value);
      }
   });
   
   Object.defineProperty(sok, 'sick', {
      get: function (): boolean {
         return getSick(this);
      },
      set: function (value: boolean): void {
         setSick(this, value);
      }
   });
}