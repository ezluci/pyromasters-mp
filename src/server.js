const express = require('express')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
app.get('*', (req, res) => {
   res.sendFile(req.path, { root: __dirname })
})

const server = http.createServer(app)
const io = new socketio.Server(server)

server.listen(parseInt(PORT), () => {
   console.log(`Server-ul functioneaza pe portul ${PORT}.`)
})

const ROOM_STATUS = {
   WAITING: 'waiting',
   STARTING: 'starting',
   STARTED: 'started'
}

const IDS = new Map() // info about all socket_ids
const ROOMS = new Map() // info about all rooms

io.on('connection', (socket) => {

   let username, room, color, isOwner

   function detailsOkCheck() {
      if (!username) {
         socket.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted. DISCONNECTED.')
         socket.disconnect()
         return false
      }
      return true
   }

   socket.on('playerJoined', (username1, room1, callback) => {
      if (!username1) {
         socket.emit('error', 'playerJoined: invalid username. DISCONNECTED.')
         socket.disconnect()
         return
      }
      if (!room1) {
         socket.emit('error', 'playerJoined: invalid room. DISCONNECTED.')
         socket.disconnect()
         return
      }

      username = username1
      room = room1
      color = 'spectator'
      if (!io.sockets.adapter.rooms.get(room)) {
         isOwner = true
         ROOMS.set(room, {owner: username, whiteTaken: false, blackTaken: false, orangeTaken: false,
            greenTaken: false, status: ROOM_STATUS.WAITING}
         )
      }
      isOwner = !(io.sockets.adapter.rooms.get(room))

      // TODO: what if the owner leaves?
      
      console.log(`connected:    ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      
      socket.join(room)
      socket.to(room).emit('player+', username, color, isOwner)
      IDS.set(socket.id, {username, room, color, isOwner})

      const players = []
      io.sockets.adapter.rooms.get(room).forEach((otherSocketId) => {
         const otherPlayer = IDS.get(otherSocketId)
         players.push({username: otherPlayer.username, color: otherPlayer.color, isOwner: otherPlayer.isOwner})
      })

      callback(players)
   })


   socket.on('tryStart', () => {
      if (!detailsOkCheck())
         return
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'tryStart: Cannot start game. Room is not in WAITING status.')
      
      io.to(room).emit('begin_startCountdown', username)
   })


   socket.on('selectColor', (newColor, callback) => {
      if (!detailsOkCheck())
         return
      
      if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
         return socket.emit('error', 'selectColor: invalid color.')
      
      if (newColor !== 'spectator' && ROOMS.get(room)[`${newColor}Taken`])
         return socket.emit('error', 'selectColor: color already taken.')
      
      if (color !== 'spectator')
         ROOMS.get(room)[`${color}Taken`] = false
      ROOMS.get(room)[`${newColor}Taken`] = true

      color = newColor
      IDS.get(socket.id).color = newColor
      io.to(room).emit('player~', username, username, color, isOwner)

      callback()
   })

   
   socket.on('coords', (coords) => {
      if (!detailsOkCheck())
         return
      
      socket.to(room).emit('coords', color, coords)
      IDS.get(socket.id).x = coords.x
      IDS.get(socket.id).y = coords.y
   })


   socket.on('disconnect', () => {
      if (!username || !room)
         return
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      socket.to(room).emit('player-', username)
      IDS.delete(socket.id)
      if (!io.sockets.adapter.rooms.get(room))
         ROOMS.delete(room)
   })
})