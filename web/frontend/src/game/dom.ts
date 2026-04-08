import { Color, Player } from "./types";

export class Dom {
   // elements
   static canvas = document.querySelector('#canvas') as HTMLCanvasElement;

   static log = document.querySelector('#log-messages') as HTMLDivElement;
   static playerList = document.querySelector('#player-list') as HTMLUListElement;
   static ping = document.querySelector('#ping') as HTMLSpanElement;

   static loading = document.querySelector('#loading') as HTMLSpanElement;
   static startButton = document.querySelector('#start-button') as HTMLButtonElement;
   static suicideButton = document.querySelector('#suicide-button') as HTMLButtonElement;
   static mapSelected = document.querySelector('#map-selected') as HTMLSelectElement;
   static chatSendMsg = document.querySelector('#chat-send-message') as HTMLButtonElement;

   static roomStatus = document.querySelector('#room-status') as HTMLSpanElement;
   static selectColors = document.querySelector('#select-color') as HTMLDivElement;
   static selectMap = document.querySelector('#select-map') as HTMLDivElement;
   static chatInput = document.querySelector('#chat-input') as HTMLInputElement;
   static slider = document.querySelector('#volume') as HTMLInputElement;

   static selectWhite = document.querySelector('#white') as HTMLButtonElement;
   static selectBlack = document.querySelector('#black') as HTMLButtonElement;
   static selectOrange = document.querySelector('#orange') as HTMLButtonElement;
   static selectGreen = document.querySelector('#green') as HTMLButtonElement;
   static selectSpectator = document.querySelector('#spectator') as HTMLButtonElement;

   static powerupsMain = document.querySelector('#powerups') as HTMLDivElement;
   static powerups = {} as { [C in Color]: PowerupDOM };

   // functions
   static addPlayer = DOM_addPlayer.bind(this);
   static updatePlayer = DOM_updatePlayer.bind(this);
   static removePlayer = DOM_removePlayer.bind(this);
   static addChatMessage = DOM_addChatMessage.bind(this);
   static addLog = DOM_addLog.bind(this);
};


// set up Dom.powerups
type PowerupType = 'main' | 'bomblength' | 'bombtime' | 'speed' | 'kickbomb' | 'bomb1' | 'bomb2' | 'bomb3' | 'bomb4';
type PowerupDOM = {
   [P in PowerupType]: HTMLDivElement
};

Object.values(Color).forEach(color => {
   Dom.powerups[color] = {} as PowerupDOM;
   Dom.powerups[color].main = document.querySelector('#powerups-' + color) as HTMLDivElement;
   ['bomblength', 'bombtime', 'speed', 'kickbomb', 'bomb1', 'bomb2', 'bomb3', 'bomb4'].forEach((powerName: string) => {
      Dom.powerups[color][powerName as PowerupType] = document.querySelector('#powerups-' + color + '-' + powerName) as HTMLDivElement;
   });
}); // at least it's short

function DOM_addPlayer(this: typeof Dom, player: Player) {
  const li = document.createElement('li');
  li.innerText = player.name;

  li.dataset.name = player.name;
  li.dataset.id = player.id.toString();

  li.style.backgroundColor = 'gray';
  li.style.fontWeight = 'bolder';
  li.style.color = 'black';
  Dom.playerList.appendChild(li);
}

function DOM_updatePlayer(this: typeof Dom, player: Player) {
  Array.from(Dom.playerList.children).forEach((child) => {
    const liChild = child as HTMLLIElement;
    if (liChild.dataset.id === player.id.toString()) {
      // color
      liChild.style.backgroundColor = (player.color === null ? 'gray' : player.color);
      if (player.color === Color.BLACK) {
        liChild.style.color = 'white';
      } else {
        liChild.style.color = 'black';
      }

      // isOwner
      liChild.innerText = player.name;
      if (player.isOwner) {
        liChild.innerText += ` ${String.fromCodePoint(0x1F451)}`;
      }
    }
  });
}

function DOM_removePlayer(this: typeof Dom, player: Player) {
  Array.from(Dom.playerList.children).forEach((child) => {
    if ((child as HTMLLIElement).dataset.id === player.id.toString()) {
      child.remove();
      return;
    }
  })
}

function DOM_addChatMessage(this: typeof Dom, userName: string, msg: string) {
   const div = document.createElement('div');
   div.innerText = `Player ${userName}: ${msg}`;
   this.log.append(div);
   this.log.scrollTop = this.log.scrollHeight;
}

function DOM_addLog(this: typeof Dom, msg: string) {
   const date = new Date();
   const spanEl = document.createElement('span');
   spanEl.style.display = 'block';
   spanEl.innerText = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}: ${msg}`;
   this.log.appendChild(spanEl);
   this.log.scrollTop = this.log.scrollHeight;
}