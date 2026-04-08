import { WebSocket } from "ws";
import { Color, RoomStatus } from "../game-types";
import { OutPackets } from "../out-packets/out-packets";

export function processPacket_selectColor(sok: WebSocket, packet: Buffer) {
  if (sok.isGuest) {
    return;
  }
  
  if (packet.length !== 2) {
    return;
  }

  const newColor = (
    packet[1] > Object.values(Color).length ? undefined :
    packet[1] === 0 ? null :
    Object.values(Color)[packet[1] - 1]
  );

  if (newColor === undefined) {
    return;
  }

  if (sok.color === newColor) {
    return;
  }
  
  if (sok.room.status !== RoomStatus.WAITING) {
    OutPackets.send_error(sok, 'selectColor: Room is not in WAITING status.');
    return;
  }
  
  if (newColor !== null && sok.room[newColor] !== null) {
    OutPackets.send_error(sok, 'selectColor: color already taken.');
    return;
  }
  
  if (sok.color !== null) {
    sok.room[sok.color] = null;
  }
  
  sok.color = newColor;
  if (newColor !== null) {
    sok.room[newColor] = sok;
  }

  OutPackets.send_playerAttribute(sok.room, sok, 'color');
}