'use strict';

let logElm, playerListElm, powerupsMainDOM, powerupsDOM;

const DEFAULT_VOLUME = 20;

const params = new URLSearchParams(window.location.search);
const usernameHTML = params.get('username');
const roomHTML = params.get('room');

if (document.readyState === 'loading') {
   document.addEventListener('DOMContentLoaded', loadElmVariables);
} else {
   loadElmVariables();
}

function loadElmVariables() {
   logElm = document.querySelector('#log-messages');

   playerListElm = document.querySelector('#player-list');
   
   powerupsMainDOM = document.querySelector('#powerups');
   
   powerupsDOM = {};
   ['white', 'black', 'orange', 'green'].forEach(color => {
      powerupsDOM[color] = {};
      powerupsDOM[color].main = document.querySelector('#powerups-' + color);
      ['bomblength', 'bombtime', 'speed', 'kickbomb', 'bomb1', 'bomb2', 'bomb3', 'bomb4'].forEach(powerName => {
         powerupsDOM[color][powerName] = document.querySelector('#powerups-' + color + '-' + powerName);
      });
   });
}


function addPlayerToList(username, color, isOwner) {
   const li = document.createElement('li')
   li.innerText = username
   if (isOwner)
      li.innerText += ` ${String.fromCodePoint(0x1F451)}`

   li.dataset.username = username
   li.style.backgroundColor = (color === null || color === 'spectator' ? 'gray' : color)
   li.style.fontWeight = 'bolder'
   if (color === 'black')
      li.style.color = 'white'
   else
      li.style.color = 'black'
   playerListElm.appendChild(li)
}


function removePlayerFromList(username) {
   Array.from(playerListElm.children).forEach((child) => {
      if (child.dataset.username === username) {
         child.remove()
         return
      }
   })
}


function changePlayerFromList(oldUsername, username, color, isOwner) {
   Array.from(playerListElm.children).forEach((child) => {
      if (child.dataset.username === oldUsername) {
         child.innerText = username
         if (isOwner)
            child.innerText += ` ${String.fromCodePoint(0x1F451)}`
         
         child.dataset.username = username
         child.style.backgroundColor = (color === 'spectator' ? 'gray' : color)
         if (color === 'black')
            child.style.color = 'white'
         else
            child.style.color = 'black'
      }
   })
}


function addChatMessage(username, msg) {
   const div = document.createElement('div');
   div.innerText = `Player ${username}: ${msg}`;
   logElm.append(div);
   logElm.scrollTop = logElm.scrollHeight;
}


function modifyPlayerPowerups(color, powerup, value) {
   console.log(color, powerup, value);
   if (powerup === 'bomblength') {
      powerupsDOM[color]['bomblength'].querySelector('span').innerText = value;
   } else if (powerup === 'bombtime') {
      console.log(value);
      powerupsDOM[color]['bombtime'].querySelector('span').innerText = value / 1000 + 's';
   } else if (powerup === 'speed') {
      powerupsDOM[color]['speed'].querySelector('span').innerText = (
         value === MOVE_SPEEDS[0] ? 'LOW' :
         value === MOVE_SPEEDS[1] ? 'MED' :
         value === MOVE_SPEEDS[2] ? 'HIGH' :
         'ERR'
      );
   } else if (powerup === 'kickbomb') {
      powerupsDOM[color]['kickbomb'].style.visibility = (value ? 'visible' : 'hidden');
   } else if (powerup === 'bombcount') {
      for (let i = 1; i <= value; ++i) {
         powerupsDOM[color][`bomb${i}`].style.visibility = 'visible';
      }
      for (let i = value + 1; i <= 4; ++i) {
         powerupsDOM[color][`bomb${i}`].style.visibility = 'hidden';
      }
   } else {
      console.error('error update player status');
   }
}

function addLog(msg) {
   const date = new Date()
   const spanEl = document.createElement('span')
   spanEl.style.display = 'block'
   spanEl.innerText = `log ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')} - ${msg}`
   logElm.appendChild(spanEl)
}

function invertHex(hex) {
   return (Number(`0x1${hex}`) ^ 0xFFFFFF).toString(16).substring(1).toUpperCase()
}

function loadImage(src) {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
   });
}