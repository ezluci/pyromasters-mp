import { MOVE_SPEEDS } from "./game-consts";
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

export function addPlayerToList(userName: string, color: Color | null, isOwner: boolean) {
   const li = document.createElement('li');
   li.innerText = userName;
   if (isOwner) {
      li.innerText += ` ${String.fromCodePoint(0x1F451)}`;
   }

   li.dataset.username = userName;
   li.style.backgroundColor = (color === null ? 'gray' : color);
   li.style.fontWeight = 'bolder';
   if (color === 'black') {
      li.style.color = 'white';
   } else {
      li.style.color = 'black';
   }
   playerListElm.appendChild(li);
}


export function removePlayerFromList(userName: string) {
   Array.from(playerListElm.children).forEach((child) => {
      if ((child as HTMLLIElement).dataset.username === userName) {
         child.remove();
         return;
      }
   })
}


export function changePlayerFromList(oldUserName: string, userName: string, color: Color | null, isOwner: boolean) {
   Array.from(playerListElm.children).forEach((child) => {
      const liChild = child as HTMLLIElement;
      if (liChild.dataset.username === oldUserName) {
         liChild.innerText = userName;
         if (isOwner) {
            liChild.innerText += ` ${String.fromCodePoint(0x1F451)}`;
         }
         
         liChild.dataset.username = userName;
         liChild.style.backgroundColor = (color === null ? 'gray' : color);
         if (color === Color.BLACK) {
            liChild.style.color = 'white';
         } else {
            liChild.style.color = 'black';
         }
      }
   });
}


export function addChatMessage(userName: string, msg: string) {
   const div = document.createElement('div');
   div.innerText = `Player ${userName}: ${msg}`;
   logElm.append(div);
   logElm.scrollTop = logElm.scrollHeight;
}


export function modifyPlayerPowerups(color: Color, powerup: string, value: string) {
   const valueNumber = parseFloat(value);
   if (powerup === 'bomblength') {
      powerupsDOM[color]['bomblength'].querySelector('span')!.innerText = value;
   } else if (powerup === 'bombtime') {
      powerupsDOM[color]['bombtime'].querySelector('span')!.innerText = valueNumber / 1000 + 's';
   } else if (powerup === 'speed') {
      powerupsDOM[color]['speed'].querySelector('span')!.innerText = (
         valueNumber === MOVE_SPEEDS[0] ? 'LOW' :
         valueNumber === MOVE_SPEEDS[1] ? 'MED' :
         valueNumber === MOVE_SPEEDS[2] ? 'HIGH' :
         'ERR'
      );
   } else if (powerup === 'kickbomb') {
      powerupsDOM[color]['kickbomb'].style.visibility = (value ? 'visible' : 'hidden');
   } else if (powerup === 'bombcount') {
      for (let i = 1; i <= valueNumber; ++i) {
         (powerupsDOM[color] as any)[`bomb${i}`].style.visibility = 'visible';
      }
      for (let i = valueNumber + 1; i <= 4; ++i) {
         (powerupsDOM[color] as any)[`bomb${i}`].style.visibility = 'hidden';
      }
   } else {
      addLog('error update player status');
   }
}

export function addLog(msg: string) {
   const date = new Date();
   const spanEl = document.createElement('span');
   spanEl.style.display = 'block';
   spanEl.innerText = `log ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')} - ${msg}`;
   logElm.appendChild(spanEl);
   logElm.scrollTop = logElm.scrollHeight;
}


chatInputElm.value = '';

if (isMobile) {
   addLog('please rotate your device in landscape mode.')
}

if (!isMobile) {
   sliderElm.type = 'range';
   sliderElm.min = '0';
   sliderElm.max = '100';
   sliderElm.value = '20'; // default volume

   audio.volume(parseInt(sliderElm.value) / 100);

   sliderElm.addEventListener('input', () => { audio.volume(parseInt(sliderElm.value) / 100); });
}