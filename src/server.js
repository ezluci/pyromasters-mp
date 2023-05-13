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

const IDS = new Map()

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
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}}`)
      socket.to(room).emit('player-', username)
      IDS.delete(socket.id)
   })
})