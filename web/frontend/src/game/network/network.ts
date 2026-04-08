import { Dom } from "../dom";
import { Game } from "../game";
import { Color, Map } from "../types";
import { processPacket_addBomb } from "./in-packets/add-bomb";
import { processPacket_addFlame } from "./in-packets/add-flame";
import { processPacket_C } from "./in-packets/C";
import { processPacket_chat } from "./in-packets/chat";
import { processPacket_coords } from "./in-packets/coords";
import { processPacket_death } from "./in-packets/death";
import { processPacket_deleteBomb } from "./in-packets/delete-bomb";
import { processPacket_deleteFlame } from "./in-packets/delete-flame";
import { processPacket_endScreen } from "./in-packets/end-screen";
import { processPacket_error } from "./in-packets/error";
import { processPacket_gameTime } from "./in-packets/game-time";
import { processPacket_gridUpdate } from "./in-packets/grid-update";
import { processPacket_map } from "./in-packets/map";
import { processPacket_playSound } from "./in-packets/play-sound";
import { processPacket_playerAttribute } from "./in-packets/player-attribute";
import { processPacket_playerMinus } from "./in-packets/player-minus";
import { processPacket_playerPlus } from "./in-packets/player-plus";
import { processPacket_pong } from "./in-packets/pong";
import { processPacket_roomStatus } from "./in-packets/room-status";
import { processPacket_updateBomb } from "./in-packets/update-bomb";
import { sendPacket_chat } from "./out-packets/chat";
import { sendPacket_ping } from "./out-packets/ping";
import { sendPacket_selectColor } from "./out-packets/select-color";
import { sendPacket_startGame } from "./out-packets/start-game";
import { sendPacket_suicide } from "./out-packets/suicide";

export class Network {
   server!: WebSocket;
   timeBitmask: number;
   unresolvedPings: number[];
   unhandledFrames: Uint8Array[];
   g!: Game;
   
   static char_playerPlus = '+';
   static char_playerMinus = '-';
   static char_chat = 'c';
   static char_roomStatus = 's';
   static char_playSound = 'y';
   static char_error = 'e';
   static char_map = 'm';
   static char_gridUpdate = 'g';
   static char_gameTime = 't';
   static char_addBomb = 'b';
   static char_deleteBomb = '/';
   static char_updateBomb = '~';
   static char_endScreen = 'd';
   static char_addFlame = '4';
   static char_deleteFlame = '5';
   static char_death = 'x';
   static char_C = 'q';
   static char_coords = 'w';
   static char_pong = ':';
   // static char_ranking = 'r'; // TODO

   startHandlingPackets: (g: Game) => void;
   processFrame: (frame: Uint8Array) => void;

   constructor() {
      this.timeBitmask = 0xffffff;
      this.unresolvedPings = [];
      this.unhandledFrames = [];

      this.startHandlingPackets = startHandlingPackets.bind(this);
      this.processFrame = processFrame.bind(this);
   }

   connect(url: string): Promise<void> {
      this.server = new WebSocket(url);
      this.server.binaryType = 'arraybuffer';

      return new Promise((resolve) => {
         this.server.onopen = () => {
            Dom.addLog('Connected to server');
            resolve();
            this.server.onopen = null;
         }

         this.server.onmessage = (event) => {
            if (!(event.data instanceof ArrayBuffer)) {
               return;
            }
            const frame = new Uint8Array(event.data);
            this.unhandledFrames.push(frame);
         }

         this.server.onclose = () => {
            Dom.addLog('websocket closed. refresh the page.');
         }
      });
   }
}


function startHandlingPackets(this: Network, g: Game) {
   if (this.g === undefined) {
      this.g = g;
   } else {
      throw new Error("Network::startHandlingPackets called twice.");
   }

   this.unhandledFrames.forEach(frame => {
      this.processFrame(frame);
   });
   
   this.server.onmessage = (event) => {
      if (!(event.data instanceof ArrayBuffer)) {
         return;
      }
      const frame = new Uint8Array(event.data);
      this.processFrame(frame);
   }


   // set button actions
   Dom.selectWhite.addEventListener('click', () => sendPacket_selectColor(g, Color.WHITE));
   Dom.selectBlack.addEventListener('click', () => sendPacket_selectColor(g, Color.BLACK));
   Dom.selectOrange.addEventListener('click', () => sendPacket_selectColor(g, Color.ORANGE));
   Dom.selectGreen.addEventListener('click', () => sendPacket_selectColor(g, Color.GREEN));
   Dom.selectSpectator.addEventListener('click', () => sendPacket_selectColor(g, null));

   Dom.startButton.addEventListener('click', () => {
      if ((window as any).myUser.name === 'testmap:)') {
         sendPacket_startGame(g, Map.TESTMAP);
      } else {
         sendPacket_startGame(g, Dom.mapSelected.value as Map);
      }
   });

   Dom.suicideButton.addEventListener('click', () => {
      sendPacket_suicide(g);
   });

   Dom.chatSendMsg.addEventListener('click', () => {
      sendPacket_chat(g, Dom.chatInput.value);
      Dom.chatInput.value = '';
   });


   const pingDelay = 1000;
   let connectionLost = false;

   // ping loop
   const pingLoopIntv = setInterval(() => {
      if (this.server.readyState === WebSocket.CLOSING || this.server.readyState === WebSocket.CLOSED) {
         clearInterval(pingLoopIntv);
         return;
      }
      
      const time = performance.now() & this.timeBitmask;
      sendPacket_ping(g, time);
      this.unresolvedPings.push(time);

      const timeSinceFirstUnresolved = (time - this.unresolvedPings[0] + this.timeBitmask+1) & this.timeBitmask;
      
      if (timeSinceFirstUnresolved >= pingDelay * 8) {
         Dom.addLog('connection closed. refresh the page.');
         this.server.close();
         clearInterval(pingLoopIntv);
      } else if (timeSinceFirstUnresolved >= pingDelay * 1.75) {
         connectionLost = true;
         Dom.addLog('can\'t hear from server, wait...');
      } else if (connectionLost) {
         connectionLost = false;
         Dom.addLog('reconnected!');
      }
   }, pingDelay);
}

function processFrame(this: Network, frame: Uint8Array) {
   if (!this.g) {
      throw new Error("Network::processFrame: g does not exist.");
   }

   let idx = 0;
   while (idx < frame.length) {
      const packetLength = frame[idx] << 8 | frame[idx+1];
      idx += 2;

      const packet = frame.slice(idx, idx + packetLength);
      const packetType = String.fromCharCode(packet[0]);
   
      // console.warn(`debug recv packet (${packetType} d${packet[0]}) ${packet.subarray(1)}.`);
   
      if (packetType === Network.char_playerPlus) {
         processPacket_playerPlus(packet, this.g);
      } else if (packetType === Network.char_playerMinus) {
         processPacket_playerMinus(packet, this.g);
      } else if (packetType === Network.char_chat) {
         processPacket_chat(packet, this.g);
      } else if (packetType === Network.char_roomStatus) {
         processPacket_roomStatus(packet, this.g);
      } else if (packetType === Network.char_playSound) {
         processPacket_playSound(packet, this.g);
      } else if (packetType === Network.char_error) {
         processPacket_error(packet, this.g);
      } else if (packetType === Network.char_map) {
         processPacket_map(packet, this.g);
      } else if (packetType === Network.char_gridUpdate) {
         processPacket_gridUpdate(packet, this.g);
      } else if (packetType === Network.char_gameTime) {
         processPacket_gameTime(packet, this.g);
      } else if (packetType === Network.char_addBomb) {
         processPacket_addBomb(packet, this.g);
      } else if (packetType === Network.char_deleteBomb) {
         processPacket_deleteBomb(packet, this.g);
      } else if (packetType === Network.char_updateBomb) {
         processPacket_updateBomb(packet, this.g);
      } else if (packetType === Network.char_endScreen) {
         processPacket_endScreen(packet, this.g);
      } else if (packetType === Network.char_addFlame) {
         processPacket_addFlame(packet, this.g);
      } else if (packetType === Network.char_deleteFlame) {
         processPacket_deleteFlame(packet, this.g);
      } else if (packetType === Network.char_death) {
         processPacket_death(packet, this.g);
      } else if (packetType === Network.char_C) {
         processPacket_C(packet, this.g);
      } else if (packetType === Network.char_coords) {
         processPacket_coords(packet, this.g);
      } else if (packetType === Network.char_pong) {
         processPacket_pong(packet, this.g);
      } else if (packet[0] <= 13) {
         processPacket_playerAttribute(packet, this.g);
      } else {
         console.error(`received unknown packet (${packetType} d${packet[0]}).`);
      }

      idx += packetLength;
   }
}