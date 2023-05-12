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

   let username, room

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
      
      console.log(`connected:    ${socket.id}, {username: ${username}, room: ${room}}`)
      
      socket.join(room)
      socket.to(room).emit('player+', username)
      IDS.set(socket.id, {username: username, room: room})

      const players = []
      io.sockets.adapter.rooms.get(room).forEach((otherSocketId) => {
         players.push(IDS.get(otherSocketId).username)
      })

      callback(players)
   })


   socket.on('tryStart', () => {
      io.to(room).emit('begin_startCountdown', username)
   })


   socket.on('disconnecting', (reason) => {
      
   })

   socket.on('disconnect', () => {
      if (!username || !room)
         return
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}}`)
      socket.to(room).emit('player-', username)
      IDS.delete(socket.id)
   })
})