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

socket.on('coords', (color, coords1) => {
   coords[color].x = coords1.x
   coords[color].y = coords1.y
})

socket.on('map', (map1) => { // a 2d array
   map = map1
})

socket.on('error', (msg) => {
   addLog(`ERROR FROM SERVER: ${msg}`)
   console.error(`ERROR FROM SERVER: ${msg}`)
})