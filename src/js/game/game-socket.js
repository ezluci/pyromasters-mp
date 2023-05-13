const socket = io()

socket.on('player+', (username, color, isOwner) => {
   addPlayerToList(username, color, isOwner)
})

socket.on('player-', (username) => {
   removePlayerFromList(username)
})

socket.on('player~', (oldUsername, username, color, isOwner) => {
   changePlayerFromList(oldUsername, username, color, isOwner)
})

socket.on('begin_startCountdown', (initiator) => {
   document.querySelector('#start-status').innerText = `'${initiator}' started the game. starting in 3`
   setTimeout(() => {
      document.querySelector('#start-status').innerText = `'${initiator}' started the game. starting in 2`
      setTimeout(() => {
         document.querySelector('#start-status').innerText = `'${initiator}' started the game. starting in 1`
         setTimeout(() => {
            document.querySelector('#start-status').innerText = `game started.`
         }, 1000)
      }, 1000)
   }, 1000)
})

socket.on('coords', (color, coords1) => {
   coords[color].x = coords1.x
   coords[color].y = coords1.y
})

socket.on('error', (msg) => {
   const createdElem = document.createElement('span')
   createdElem.innerText = 'ERROR FROM SERVER, check console!'
   document.body.appendChild(createdElem)
   console.error(`ERROR FROM SERVER: ${msg}`)
   
   setTimeout(() => {
      createdElem.remove()
   }, 5000)
})