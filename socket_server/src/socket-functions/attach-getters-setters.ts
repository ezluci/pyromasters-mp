import { Socket } from "socket.io";
import { BOMB_TIMES, MOVE_SPEEDS, SHIELD_TIME_TICKS, SICK_TIME_TICKS } from "../game-consts";

let _speed: number;
let _bombTime: number;
let _shield: boolean;
let _sick: boolean;

function getSpeed(): number {
   return _speed;
}

function setSpeed(sok: Socket, value: number): void {
   if (!MOVE_SPEEDS.includes(value)) {
      console.error('wrong speed');
      return;
   }
   if (value !== _speed) {
      sok.emit('speedUpdate', value);
   }
   _speed = value;
}

function getBombTime(): number {
   return _bombTime;
}

function setBombTime(value: number): void {
   if (!BOMB_TIMES.includes(value)) {
      console.error('wrong bombTime');
      return;
   }
   _bombTime = value;
}


function getShield() {
   return _shield;
}

function setShield(sok: Socket, value: boolean): void {
   if (value === false) {
      if (_shield) {
         sok.nsp.server.to(sok.room.name).emit('shield', sok.color, false);
         sok.room.ticks.removeFunc(sok.shieldFalse_tickId);
         _shield = false;
         sok.shieldFalse_tickId = 0;
      }
   } else {
      if (_shield) {
         sok.room.ticks.removeFunc(sok.shieldFalse_tickId);
      } else {
         sok.nsp.server.to(sok.room.name).emit('shield', sok.color, true);
         _shield = true;
      }
   
      const newFuncId: number | undefined = sok.room.ticks.addFunc(() => { setShield(sok, false) }, SHIELD_TIME_TICKS);
      if (typeof newFuncId === 'number') {
         sok.shieldFalse_tickId = newFuncId;
      }
   }
}


function getSick(): boolean {
   return _sick;
}

function setSick(sok: Socket, value: boolean): void {
   if (value === false) {
      if (_sick) {
         sok.nsp.server.to(sok.room.name).emit('sick0', sok.color);
         sok.room.ticks.removeFunc(sok.sickFalse_tickId);
         _sick = false;
         sok.sickFalse_tickId = 0;
      }
   } else {
      if (_sick) {
         sok.room.ticks.removeFunc(sok.sickFalse_tickId);
      } else {
         sok.nsp.server.to(sok.room.name).emit('sick1', sok.color);
         _sick = true;
      }

      const newFuncId: number | undefined = sok.room.ticks.addFunc(() => { setSick(sok, false) }, SICK_TIME_TICKS);
      if (typeof newFuncId === 'number') {
         sok.sickFalse_tickId = newFuncId;
      }
   }
}


export function attachGettersSetters(sok: Socket): void {
   _speed = sok.speed;
   _bombTime = sok.bombTime;
   _shield = sok.shield;
   _sick = sok.sick;
   
   Object.defineProperty(sok, 'speed', {
      get: function (): number {
         return getSpeed();
      },
      set: function (value: number): void {
         setSpeed(this, value);
      }
   });
   
   Object.defineProperty(sok, 'bombTime', {
      get: function (): number {
         return getBombTime();
      },
      set: function (value: number): void {
         setBombTime(value);
      }
   });
   
   Object.defineProperty(sok, 'shield', {
      get: function (): boolean {
         return getShield();
      },
      set: function (value: boolean): void {
         setShield(this, value);
      }
   });
   
   Object.defineProperty(sok, 'sick', {
      get: function (): boolean {
         return getSick();
      },
      set: function (value: boolean): void {
         setSick(this, value);
      }
   });
}