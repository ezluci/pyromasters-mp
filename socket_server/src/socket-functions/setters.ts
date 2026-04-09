import { WebSocket } from 'ws';
import { SHIELD_TIME_TICKS, SICK_TIME_TICKS } from '../game-consts';
import { OutPackets } from '../out-packets/out-packets';

export function setShield(this: WebSocket, value: boolean): void {
  if (value === false) {
    if (this.shield) {
      this.shield = false;
      OutPackets.send_playerAttribute(this.room, this, 'shield');
      this.room.ticks.removeFunc(this.shieldFalse_tickId);
      this.shieldFalse_tickId = 0;
    }
  } else {
    if (this.shield) {
      this.room.ticks.removeFunc(this.shieldFalse_tickId);
    } else {
      this.shield = true;
      OutPackets.send_playerAttribute(this.room, this, 'shield');
    }

    const newFuncId: number | undefined = this.room.ticks.addFunc(() => {
      this.setShield(false);
    }, SHIELD_TIME_TICKS);
    if (typeof newFuncId === 'number') {
      this.shieldFalse_tickId = newFuncId;
    }
  }
}

export function setSick(this: WebSocket, value: boolean): void {
  if (value === false) {
    if (this.sick) {
      this.sick = false;
      OutPackets.send_playerAttribute(this.room, this, 'sick');
      this.room.ticks.removeFunc(this.sickFalse_tickId);
      this.sickFalse_tickId = 0;
    }
  } else {
    if (this.sick) {
      this.room.ticks.removeFunc(this.sickFalse_tickId);
    } else {
      this.sick = true;
      OutPackets.send_playerAttribute(this.room, this, 'sick');
    }

    const newFuncId: number | undefined = this.room.ticks.addFunc(() => {
      this.setSick(false);
    }, SICK_TIME_TICKS);
    if (typeof newFuncId === 'number') {
      this.sickFalse_tickId = newFuncId;
    }
  }
}
