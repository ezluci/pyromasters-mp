import { Color } from "./game-types";
import { audio } from "./load-assets";

export const isMobile: boolean = (window.location.pathname.toLowerCase() == '/gamemobile');

export const canvasElm = document.querySelector('#canvas') as HTMLCanvasElement;
export const ctx = canvasElm.getContext('2d') as CanvasRenderingContext2D;

export const logElm = document.querySelector('#log-messages') as HTMLDivElement;
export const playerListElm = document.querySelector('#player-list') as HTMLUListElement;

export const loadingElm = document.querySelector('#loading') as HTMLSpanElement;
export const startButtonElm = document.querySelector('#start-button') as HTMLButtonElement;
export const mapSelectedElm = document.querySelector('#map-selected') as HTMLSelectElement;
export const chatSendMsgElm = document.querySelector('#chat-send-message') as HTMLButtonElement;

export const roomStatusElm = document.querySelector('#room-status') as HTMLSpanElement;
export const selectColorsElm = document.querySelector('#select-color') as HTMLDivElement;
export const selectMapElm = document.querySelector('#select-map') as HTMLDivElement;
export const chatInputElm = document.querySelector('#chat-input') as HTMLInputElement;
export const sliderElm = document.querySelector('#volume') as HTMLInputElement;

export const selectWhiteElm = document.querySelector('#white') as HTMLButtonElement;
export const selectBlackElm = document.querySelector('#black') as HTMLButtonElement;
export const selectOrangeElm = document.querySelector('#orange') as HTMLButtonElement;
export const selectGreenElm = document.querySelector('#green') as HTMLButtonElement;
export const selectSpectatorElm = document.querySelector('#spectator') as HTMLButtonElement;

export const powerupsMainDOM = document.querySelector('#powerups') as HTMLDivElement;

// ugly part incoming
type PowerupType = 'main' | 'bomblength' | 'bombtime' | 'speed' | 'kickbomb' | 'bomb1' | 'bomb2' | 'bomb3' | 'bomb4';
type PowerupDOM = {
   [P in PowerupType]: HTMLDivElement
};

export const powerupsDOM: {
   [C in Color]: PowerupDOM
} = {} as { [C in Color]: PowerupDOM };

Object.values(Color).forEach(color => {
   powerupsDOM[color] = {} as PowerupDOM; // fucking ugly
   powerupsDOM[color].main = document.querySelector('#powerups-' + color) as HTMLDivElement;
   ['bomblength', 'bombtime', 'speed', 'kickbomb', 'bomb1', 'bomb2', 'bomb3', 'bomb4'].forEach((powerName: string) => {
      powerupsDOM[color][powerName as PowerupType] = document.querySelector('#powerups-' + color + '-' + powerName) as HTMLDivElement;
   });
}); // at least it's short

export let menuSoundId: number | null = null;
export function setMenuSoundId(newValue: number | null) {
   menuSoundId = newValue;
}

export function DOM_addPlayer(userName: string) {
   const li = document.createElement('li');
   li.innerText = userName;

   li.dataset.userName = userName;

   li.style.backgroundColor = 'gray';
   li.style.fontWeight = 'bolder';
   li.style.color = 'black';
   playerListElm.appendChild(li);
}


export function DOM_removePlayer(userName: string) {
   Array.from(playerListElm.children).forEach((child) => {
      if ((child as HTMLLIElement).dataset.userName === userName) {
         child.remove();
         return;
      }
   })
}


export function DOM_changePlayerColor(userName: string, newColor: Color | null) {
   Array.from(playerListElm.children).forEach((child) => {
      const liChild = child as HTMLLIElement;
      if (liChild.dataset.userName === userName) {
         liChild.style.backgroundColor = (newColor === null ? 'gray' : newColor);
         if (newColor === Color.BLACK) {
            liChild.style.color = 'white';
         } else {
            liChild.style.color = 'black';
         }
      }
   });
}

export function DOM_changePlayerIsOwner(userName: string, isOwner: boolean) {
   Array.from(playerListElm.children).forEach((child) => {
      const liChild = child as HTMLLIElement;
      if (liChild.dataset.userName === userName) {
         liChild.innerText = userName;
         if (isOwner) {
            liChild.innerText += ` ${String.fromCodePoint(0x1F451)}`;
         }
      }
   });
}


export function DOM_addChatMessage(userName: string, msg: string) {
   const div = document.createElement('div');
   div.innerText = `Player ${userName}: ${msg}`;
   logElm.append(div);
   logElm.scrollTop = logElm.scrollHeight;
}

export function DOM_addLog(msg: string) {
   const date = new Date();
   const spanEl = document.createElement('span');
   spanEl.style.display = 'block';
   spanEl.innerText = `log ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')} - ${msg}`;
   logElm.appendChild(spanEl);
   logElm.scrollTop = logElm.scrollHeight;
}


chatInputElm.value = '';

if (isMobile) {
   DOM_addLog('please rotate your device in landscape mode.')
}

if (!isMobile) {
   sliderElm.type = 'range';
   sliderElm.min = '0';
   sliderElm.max = '100';
   sliderElm.value = '20'; // default volume

   audio.volume(parseInt(sliderElm.value) / 100);

   sliderElm.addEventListener('input', () => { audio.volume(parseInt(sliderElm.value) / 100); });
}