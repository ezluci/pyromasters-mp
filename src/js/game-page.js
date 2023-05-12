let ul
waitForElm('#player-list').then((elm) => {ul = elm})

function addPlayerToList(username) {
   const li = document.createElement('li')
   li.innerText = username
   ul.appendChild(li)
}

function removePlayerFromList(username) {
   ul.childNodes.forEach((child) => {
      if (child.innerText === username) {
         child.remove()
         return
      }
   })
}