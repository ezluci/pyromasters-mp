import { processPacket_chat } from "./chat";
import { processPacket_playerMinus } from "./player-minus";
import { processPacket_playerPlus } from "./player-plus";
import { processPacket_roomStatus } from "./room-status";
import { processPacket_playerAttribute } from "./player-attribute";
import { processPacket_playSound } from "./play-sound";
import { processPacket_error } from "./error";
import { processPacket_map } from "./map";
import { processPacket_gridUpdate } from "./grid-update";
import { processPacket_gameTime } from "./game-time";
import { processPacket_addBomb } from "./add-bomb";
import { processPacket_endScreen } from "./end-screen";
import { processPacket_deleteBomb } from "./delete-bomb";
import { processPacket_updateBomb } from "./update-bomb";
import { processPacket_addFlame } from "./add-flame";
import { processPacket_deleteFlame } from "./delete-flame";
import { processPacket_death } from "./death";
import { processPacket_coords } from "./coords";
import { processPacket_C } from "./C";

const char_playerPlus = '+';
const char_playerMinus = '-';
const char_chat = 'c';
const char_roomStatus = 's';
const char_playSound = 'y';
const char_error = 'e';
const char_map = 'm';
const char_gridUpdate = 'g';
const char_gameTime = 't';
const char_addBomb = 'b';
const char_deleteBomb = '/';
const char_updateBomb = '~';
const char_endScreen = 'd';
const char_addFlame = '4';
const char_deleteFlame = '5';
const char_death = 'x';
const char_C = 'q';
const char_coords = 'w';
const char_ranking = 'r'; // TODO

export function processPacket(packet: Uint8Array) {
   const packetType = String.fromCharCode(packet[0]);

   // console.warn(`debug recv packet (${packetType} d${packet[0]}) ${packet.subarray(1)}.`);

   if (packetType === char_playerPlus) {
      processPacket_playerPlus(packet);
   } else if (packetType === char_playerMinus) {
      processPacket_playerMinus(packet);
   } else if (packetType === char_chat) {
      processPacket_chat(packet);
   } else if (packetType === char_roomStatus) {
      processPacket_roomStatus(packet);
   } else if (packetType === char_playSound) {
      processPacket_playSound(packet);
   } else if (packetType === char_error) {
      processPacket_error(packet);
   } else if (packetType === char_map) {
      processPacket_map(packet);
   } else if (packetType === char_gridUpdate) {
      processPacket_gridUpdate(packet);
   } else if (packetType === char_gameTime) {
      processPacket_gameTime(packet);
   } else if (packetType === char_addBomb) {
      processPacket_addBomb(packet);
   } else if (packetType === char_deleteBomb) {
      processPacket_deleteBomb(packet);
   } else if (packetType === char_updateBomb) {
      processPacket_updateBomb(packet);
   } else if (packetType === char_endScreen) {
      processPacket_endScreen(packet);
   } else if (packetType === char_addFlame) {
      processPacket_addFlame(packet);
   } else if (packetType === char_deleteFlame) {
      processPacket_deleteFlame(packet);
   } else if (packetType === char_death) {
      processPacket_death(packet);
   } else if (packetType === char_C) {
      processPacket_C(packet);
   } else if (packetType === char_coords) {
      processPacket_coords(packet);
   } else if (packet[0] <= 13) {
      processPacket_playerAttribute(packet);
   } else {
      console.error(`received unknown packet (${packetType} d${packet[0]}).`);
   }
}