let playerListElm
waitForElm('#player-list').then((elm) => {playerListElm = elm})

function addPlayerToList(username) {
   const li = document.createElement('li')
   li.innerText = username
   playerListElm.appendChild(li)
}

function removePlayerFromList(username) {
   playerListElm.childNodes.forEach((child) => {
      if (child.innerText === username) {
         child.remove()
         return
      }
   })
}