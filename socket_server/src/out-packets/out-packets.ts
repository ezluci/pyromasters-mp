import { WebSocket } from "ws";
import { Room } from "../room";
import { sendPacket_playerMinus } from "./player-minus";
import { sendPacket_playerPlus } from "./player-plus";
import { sendPacket_chat } from "./chat";
import { sendPacket_roomStatus } from "./room-status";
import { sendPacket_playerAttribute } from "./player-attribute";
import { sendPacket_playSound } from "./play-sound";
import { sendPacket_error } from "./error";
import { sendPacket_map } from "./map";
import { sendPacket_gridUpdate } from "./grid-update";
import { sendPacket_gameTime } from "./game-time";
import { sendPacket_addBomb } from "./add-bomb";
import { sendPacket_updateBomb } from "./update-bomb";
import { sendPacket_deleteBomb } from "./delete-bomb";
import { sendPacket_addFlame } from "./add-flame";
import { sendPacket_deleteFlame } from "./delete-flame";
import { sendPacket_death } from "./death";
import { sendPacket_C } from "./C";
import { sendPacket_coords } from "./coords";
import { sendPacket_endScreen } from "./end-screen";
import { sendPacket_pong } from "./pong";
import { logger } from "../log";

// you use bufferPacket to pack more packets at once before actually sending them.
// the packets are sent automatically. if ~the room / the client's room~ has an active
// tick loop, then the packet buffer will be sent at the end of each loop by runEveryTick.
// if the room doesn't have an active tick loop, the packet will be sent right away.

export type Packet = {
  data: Uint8Array;
  time: number;
};

export class OutPackets {
  private static PREFIX_SIZE_BYTES = 2;
  private static buffer: Map<Room | WebSocket, Packet[]> = new Map();

  static constructFrame(packets: Packet[]): ArrayBuffer | undefined {
    let totalLength = 0;
    let lastTime = -1, notSorted = false;
    packets.forEach(packet => {
        if (lastTime >= packet.time) {
          notSorted = true;
        }
        totalLength += this.PREFIX_SIZE_BYTES + packet.data.length;
    });

    if (notSorted) {
        logger.error('constructFrame: packets are not sorted by time!');
        return undefined;
    }

    const frame = new ArrayBuffer(totalLength);
    const frameView = new DataView(frame);
    let idx = 0;
    packets.forEach(packet => {
        if (packet.data.length >= (1 << (8 * OutPackets.PREFIX_SIZE_BYTES))) {
          return logger.error('PREFIX_SIZE_BYTES not enough!');
        }
        if (OutPackets.PREFIX_SIZE_BYTES !== 2) {
          return logger.alert('change packets code!');
        }
        frameView.setUint16(idx, packet.data.length);
        idx += 2;
        for (let i = 0; i < packet.data.length; ++i) {
          frameView.setUint8(idx, packet.data[i]);
          idx += 1;
        }
    });

    return frame;
  }

  static sendFrame(target: Room | WebSocket, frame: ArrayBuffer) {
    if (target instanceof WebSocket) {
      target.send(frame);
    } else {
      target.players.forEach(player => {
        player.send(frame);
      });
      target.guests.forEach(guest => {
        guest.send(frame);
      })
    }
  }

  public static getBufferedPackets(target: Room | WebSocket): Packet[] {
    let buf = this.buffer.get(target);
    if (!buf) {
        buf = [];
        this.buffer.set(target, buf);
    }

    return buf;
  }

  public static setBufferedPackets(target: Room | WebSocket, buffer: Packet[]) {
    this.buffer.set(target, buffer);
  }

  static bufferPacket(target: Room | WebSocket, packet: Uint8Array) {
    let buf = this.buffer.get(target);
    if (!buf) {
        buf = [];
        this.buffer.set(target, buf);
    }
    buf.push({ data: packet, time: performance.now() });

    const room = (target instanceof Room ? target : target?.room);
    if (!room || !room.ticks.tickLoopIntervalId) {
        const frame = this.constructFrame(buf);
        if (!frame) {
          return logger.error('bufferPacket: can\'t construct frame');
        }
        this.sendFrame(target, frame);
        this.buffer.set(target, []);
    }
    // else, the tickLoop will eventually send the buffers
  }


  static send_playerPlus = sendPacket_playerPlus;
  static send_playerMinus = sendPacket_playerMinus;
  static send_chat = sendPacket_chat;
  static send_roomStatus = sendPacket_roomStatus;
  static send_playerAttribute = sendPacket_playerAttribute;
  static send_playSound = sendPacket_playSound;
  static send_error = sendPacket_error;
  static send_endScreen = sendPacket_endScreen;
  static send_map = sendPacket_map;
  static send_gridUpdate = sendPacket_gridUpdate;
  static send_gameTime = sendPacket_gameTime;
  static send_addBomb = sendPacket_addBomb;
  static send_deleteBomb = sendPacket_deleteBomb;
  static send_updateBomb = sendPacket_updateBomb;
  static send_addFlame = sendPacket_addFlame;
  static send_deleteFlame = sendPacket_deleteFlame;
  static send_death = sendPacket_death;
  static send_C = sendPacket_C;
  static send_coords = sendPacket_coords;
  static send_pong = sendPacket_pong;
};