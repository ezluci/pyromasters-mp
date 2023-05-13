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

const IDS = new Map() // info about all socket_ids
const ROOMS = new Map() // info about all rooms

io.on('connection', (socket) => {

   let username, room, color, isOwner

   socket.on('playerJoined', (username1, room1, callback) => {
      if (!username1) {
         socket.emit('error', 'invalid username')
         socket.disconnect()
         return
      }
      if (!room1) {
         socket.emit('error', 'invalid room')
         socket.disconnect()
         return
      }

      username = username1
      room = room1
      color = 'spectator'
      if (!io.sockets.adapter.rooms.get(room)) {
         isOwner = true
         ROOMS.set(room, {owner: username, whiteTaken: false, blackTaken: false, orangeTaken: false, greenTaken: false})
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
      io.to(room).emit('begin_startCountdown', username)
   })


   socket.on('selectColor', (color1) => {
      if (color1 !== 'spectator' || color1 !== 'white' || color1 !== 'black' || color1 !== 'orange' || color1 !== 'green')
         return socket.emit('error', 'invalid color for selectColor.')
      
      if (color1 !== 'spectator' && ROOMS.get(room)[`${color1}Taken`])
         return socket.emit('error', 'color already taken')
      
      ROOMS.get(room)[`${color}Taken`] = false
      ROOMS.get(room)[`${color1}Taken`] = true
      color = color1
      IDS.get(socket.id).color = color1
      io.to(room).emit('player~', username, username, color, isOwner)
   })

   
   socket.on('coords', (coords) => {
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