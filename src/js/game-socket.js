const socket = io()

socket.on('player+', (username) => {
   addPlayerToList(username)
})

socket.on('player-', (username) => {
   removePlayerFromList(username)
})

socket.on('begin_startCountdown', (initiator) => {
   document.querySelector('#start-status').innerText = `${initiator} started the game. starting in 3`
   setTimeout(() => {
      document.querySelector('#start-status').innerText = `${initiator} started the game. starting in 2`
      setTimeout(() => {
         document.querySelector('#start-status').innerText = `${initiator} started the game. starting in 1`
         setTimeout(() => {
            document.querySelector('#start-status').innerText = `game started.`
         }, 1000)
      }, 1000)
   }, 1000)
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