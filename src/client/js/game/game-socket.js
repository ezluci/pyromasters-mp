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

socket.on('room_status', (msg) => {
   document.querySelector('#room-status').innerText = msg
})

socket.on('mapUpdates', (blocks) => {
   blocks.forEach(({x, y, block}) => {
      map[y][x] = block
   })
})

socket.on('speedUpdate', (newSpeed) => {
   moveSpeed = newSpeed
})

socket.on('switchKeys', () => {
   switchedKeys++

   setTimeout(() => { switchedKeys--; }, ILLNESS_TIME)
})

socket.on('death', (color) => {
   if (myColor === color) {
      myColor = 'spectator'
      me = INEXISTENT_POS
   }
   coords[color] = INEXISTENT_POS
})

socket.on('coords', (color, coords1) => {
   coords[color] = coords1
})

socket.on('map', (map1) => { // a 2d array
   map = map1
})

socket.on('error', (msg) => {
   addLog(`ERROR FROM SERVER: ${msg}`)
   console.error(`ERROR FROM SERVER: ${msg}`)
})