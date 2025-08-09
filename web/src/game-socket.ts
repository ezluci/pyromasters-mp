import { gameLoop } from "./game-loop";
import { Color, Map } from "./game-types";
import { roomName, userName } from "./game-variables";
import { processPacket } from "./in-packets/process-packet";
import { sendPacket_chat } from "./out-packets/chat";
import { sendPacket_ping } from "./out-packets/ping";
import { sendPacket_selectColor } from "./out-packets/select-color";
import { sendPacket_startGame } from "./out-packets/start-game";
import { chatInputElm, chatSendMsgElm, DOM_addLog, loadingElm, mapSelectedElm, selectBlackElm, selectColorsElm, selectGreenElm, selectOrangeElm, selectSpectatorElm, selectWhiteElm, startButtonElm } from "./page";

const ez_testPC: boolean = (
   window.location.hostname === 'localhost' ||
   window.location.hostname.startsWith('192.168.') ||
   window.location.hostname === '0.0.0.0'
);
const ez_testSV: boolean = (
   window.location.hostname.startsWith('93.113.33.138')
);

if (ez_testPC) {
   DOM_addLog('ez_testPC');
}
if (ez_testSV) {
   DOM_addLog('ez_testPC');
}

const protocol = (ez_testPC || ez_testSV ? 'http' : 'https');
const port = (ez_testSV ? 3301 : 22822);
const url = `${protocol}://${window.location.hostname}:${port}/${encodeURIComponent(userName)}/${encodeURIComponent(roomName)}`;


export const server = new WebSocket(url);
server.binaryType = 'arraybuffer';

server.onopen = () => {
   loadingElm.hidden = true;
   selectColorsElm.hidden = false;
   requestAnimationFrame(gameLoop);
}

server.onmessage = (event) => {
   if (!(event.data instanceof ArrayBuffer)) {
      return;
   }
   const frame = new Uint8Array(event.data);
   
   let idx = 0;
   while (idx < frame.length) {
      const packetLength = frame[idx] << 8 | frame[idx+1];
      idx += 2;
      processPacket(frame.slice(idx, idx + packetLength));
      idx += packetLength;
   }
}

server.onclose = () => {
   DOM_addLog('websocket closed. refresh the page.');
}


// set button actions
selectWhiteElm.addEventListener('click', () => sendPacket_selectColor(Color.WHITE));
selectBlackElm.addEventListener('click', () => sendPacket_selectColor(Color.BLACK));
selectOrangeElm.addEventListener('click', () => sendPacket_selectColor(Color.ORANGE));
selectGreenElm.addEventListener('click', () => sendPacket_selectColor(Color.GREEN));
selectSpectatorElm.addEventListener('click', () => sendPacket_selectColor(null));
startButtonElm.addEventListener('click', () => {
   if (userName === 'testmap:)') {
      sendPacket_startGame(Map.TESTMAP);
   } else {
      sendPacket_startGame(mapSelectedElm.value as Map);
   }
});
chatSendMsgElm.addEventListener('click', () => {
   sendPacket_chat(chatInputElm.value);
   chatInputElm.value = '';
});


export const timeBitmask = 0xffffff;
const pingDelay = 1000;
export const unresolvedPings: number[] = [];
let connectionLost = false;

// ping loop
const pingLoopIntv = setInterval(() => {
   if (server.readyState === WebSocket.CLOSING || server.readyState === WebSocket.CLOSED) {
      clearInterval(pingLoopIntv);
      return;
   }
   
   const time = performance.now() & timeBitmask;
   sendPacket_ping(time);
   unresolvedPings.push(time);

   const timeSinceFirstUnresolved = (time - unresolvedPings[0] + timeBitmask+1) & timeBitmask;
   
   if (timeSinceFirstUnresolved >= pingDelay * 8) {
      DOM_addLog('connection closed. refresh the page.');
      server.close();
      clearInterval(pingLoopIntv);
   } else if (timeSinceFirstUnresolved >= pingDelay * 1.75) {
      connectionLost = true;
      DOM_addLog('can\'t hear from server, wait...');
   } else if (connectionLost) {
      connectionLost = false;
      DOM_addLog('reconnected!');
   }
}, pingDelay);