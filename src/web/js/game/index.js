'use strict';

let playerListElm;
waitForElm('#player-list').then((elm) => {playerListElm = elm});


function addPlayerToList(username, color, isOwner) {
   const li = document.createElement('li')
   li.innerText = username
   if (isOwner)
      li.innerText += ` ${String.fromCodePoint(0x1F451)}`

   li.dataset.username = username
   li.style.backgroundColor = (color === 'spectator' ? 'gray' : color)
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