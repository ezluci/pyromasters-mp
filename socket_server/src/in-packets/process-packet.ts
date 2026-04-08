import { WebSocket } from "ws";
import { processPacket_chat } from "./chat";
import { processPacket_selectColor } from "./select-color";
import { processPacket_startGame } from "./start-game";
import { processPacket_portalTp } from "./portal-tp";
import { processPacket_placeBomb } from "./place-bomb";
import { processPacket_coords } from "./coords";
import { processPacket_kickBomb } from "./kick-bomb";
import { processPacket_ping } from "./ping";
import { processPacket_suicide } from "./suicide";

const char_chat = 'C'.charCodeAt(0);
const char_selectColor = 'O'.charCodeAt(0);
const char_startGame = 'G'.charCodeAt(0);
const char_portalTp = 'P'.charCodeAt(0);
const char_placeBomb = 'B'.charCodeAt(0);
const char_coords = 'S'.charCodeAt(0);
const char_kickBomb = 'K'.charCodeAt(0);
const char_ping = ';'.charCodeAt(0);
const char_suicide = 'Q'.charCodeAt(0);

export function processPacket(sok: WebSocket, packet: Buffer) {
  if (packet.length === 0) {
    return;
  }
  
  const packetType = packet[0];

  if (packetType === char_chat) {
    processPacket_chat(sok, packet);
  } else if (packetType === char_selectColor) {
    processPacket_selectColor(sok, packet);
  } else if (packetType === char_startGame) {
    processPacket_startGame(sok, packet);
  } else if (packetType === char_portalTp) {
    processPacket_portalTp(sok, packet);
  } else if (packetType === char_placeBomb) {
    processPacket_placeBomb(sok, packet);
  } else if (packetType === char_coords) {
    processPacket_coords(sok, packet);
  } else if (packetType === char_kickBomb) {
    processPacket_kickBomb(sok, packet);
  } else if (packetType === char_ping) {
    processPacket_ping(sok, packet);
  } else if (packetType === char_suicide) {
    processPacket_suicide(sok, packet);
  }
}