let playerListElm
waitForElm('#player-list').then((elm) => {playerListElm = elm})


function addPlayerToList(username, color, isOwner) {
   const li = document.createElement('li')

   li.innerText = username
   if (isOwner)
      li.innerText += ` ${String.fromCodePoint(0x1F451)}`

   li.dataset.username = username
   li.style.backgroundColor = (color === 'spectator' ? 'gray' : color)
   li.style.fontWeight = 'bolder'
   li.style.color = '#72cfdb'
   playerListElm.appendChild(li)
}


function removePlayerFromList(username) {
   playerListElm.childNodes.forEach((child) => {
      if (child.dataset.username === username) {
         child.remove()
         return
      }
   })
}


function changePlayerFromList(oldUsername, username, color, isOwner) {
   playerListElm.childNodes.forEach((child) => {
      if (child.dataset.username === oldUsername) {
         child.innerText = username
         if (isOwner)
            child.innerText += ` ${String.fromCodePoint(0x1F451)}`
         
         child.dataset.username = username
         child.style.backgroundColor = (color === 'spectator' ? 'gray' : color)
      }
   })
}