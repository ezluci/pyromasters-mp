import { Resources } from "./resources";
import { Dom } from "./dom";
import { Network } from "./network/network";
import { Game } from "./game";
import { Keys } from "./keys";
import { Animations } from "./animations";
import "../toast/toast.css";
import "../toast/toast";
import "../topbar";

export const ez_testPC: boolean = (
  window.location.hostname === 'localhost' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname === '0.0.0.0'
);
export const ez_testSV: boolean = (
  window.location.hostname.startsWith('93.113.33.138')
);

const queryParams = new URLSearchParams(window.location.search);
const roomName = queryParams.get('room');
if (!roomName) {
  throw new Error("Missing query param 'room'.");
}

Dom.chatInput.value = '';


// load resources, animations, connect to server

const url = `${(window as any).socketUrl}/${encodeURIComponent(roomName)}`;

const network = new Network;

await Promise.all([ Resources.load(), Animations.init(), network.connect(url) ]);

// start the game

export const g = new Game(network, roomName);
network.startHandlingPackets(g);
Keys.init(g);

// wait for my player before starting
if (!g.isGuest) {
  const intv = setInterval(() => {
    if (g.myPlayer) {
      g.startLoop();
      clearInterval(intv);
    }
  }, 100);
} else {
  g.startLoop();
}



if (g.isMobile) {
  Dom.addLog('please rotate your device in landscape mode.')
}

if (!g.isMobile) {
  Dom.slider.type = 'range';
  Dom.slider.min = '0';
  Dom.slider.max = '100';
  Dom.slider.value = '20'; // default volume

  Resources.audio.volume(parseInt(Dom.slider.value) / 100);

  Dom.slider.addEventListener('input', () => { Resources.audio.volume(parseInt(Dom.slider.value) / 100); });
}


// expose objects to window
if (ez_testPC || ez_testSV) {
   (window as any).g = g;
   (window as any).Dom = Dom;
   (window as any).Keys = Keys;
   (window as any).Animations = Animations;
}

if (ez_testPC) {
   Dom.addLog('debug: ez_testPC');
}
if (ez_testSV) {
   Dom.addLog('debug: ez_testSV');
}