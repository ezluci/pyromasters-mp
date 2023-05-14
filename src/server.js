const express = require('express')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
app.get('*', (req, res) => {
   res.sendFile(req.path, { root: __dirname })
})

const server = http.createServer(app)
server.listen(parseInt(PORT), () => {
   console.log(`The server works on port ${PORT}.`)
})

const ROOM_STATUS = {
   WAITING: 'waiting',
   STARTING: 'starting',
   RUNNING: 'running'
}

const BLOCKS_HORIZONTALLY = 15
const BLOCKS_VERTICALLY = 11
const BLOCK_SIZE = 53
const MOVE_SPEED = 0.3 // default 0.15 maybe?
const BLOCK_SAFE_PX = 5

const MIN_X = 0
const MIN_Y = 0
const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1)
const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1)

const INEXISTENT_POS = {x: -100, y: -100}
const DEFAULT_POS = {
   white: {x: MIN_X, y: MIN_Y}, black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y}, green: {x: MIN_X, y: MAX_Y},
   spectator: INEXISTENT_POS
}


const io = new socketio.Server(server)

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
      isOwner = !(io.sockets.adapter.rooms.get(room))

      if (isOwner) {
         ROOMS.set(room, {
            owner: username,
            white: {username: undefined, x: DEFAULT_POS['white'].x, y: DEFAULT_POS['white'].y},
            black: {username: undefined, x: DEFAULT_POS['black'].x, y: DEFAULT_POS['black'].y},
            orange: {username: undefined, x: DEFAULT_POS['orange'].x, y: DEFAULT_POS['orange'].y},
            green: {username: undefined, x: DEFAULT_POS['green'].x, y: DEFAULT_POS['green'].y},
            map: [],
            status: ROOM_STATUS.WAITING
         })
      }

      // TODO: what if the owner leaves?
      
      console.log(`connected:    ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      
      socket.join(room)
      socket.to(room).emit('player+', username, color, isOwner)
      IDS.set(socket.id, {username, room, color, isOwner})

      const players = [], colors = []

      io.sockets.adapter.rooms.get(room).forEach((otherSocketId) => {
         const otherPlayer = IDS.get(otherSocketId)
         players.push({username: otherPlayer.username, color: otherPlayer.color, isOwner: otherPlayer.isOwner})
      });

      ['white', 'black', 'orange', 'green'].forEach(color => {
         colors.push({color: color, x: ROOMS.get(room)[color].x, y: ROOMS.get(room)[color].y})
      })

      callback(players, colors, ROOMS.get(room).map)
   })


   socket.on('tryStart', () => {
      if (!detailsOkCheck())
         return
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'tryStart: Room is not in WAITING status.')
      
      if (!isOwner)
         return socket.emit('error', 'tryStart: You are not the owner of this room!')

      ROOMS.get(room).status = ROOM_STATUS.STARTING
      
      io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 3`)
      setTimeout(() => {
         io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 2`)
         setTimeout(() => {
            io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 1`)
            setTimeout(() => {

               /// GAME STARTS HERE!

               io.to(room).emit('room_status', `game running.`);
               ROOMS.get(room).status = ROOM_STATUS.RUNNING;

               // set coordinates for each color
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (ROOMS.get(room)[color].username === undefined) {
                     ROOMS.get(room)[color].x = INEXISTENT_POS.x
                     ROOMS.get(room)[color].y = INEXISTENT_POS.y
                  }
                  else {
                     ROOMS.get(room)[color].x = DEFAULT_POS[color].x
                     ROOMS.get(room)[color].y = DEFAULT_POS[color].y
                  }
                  
                  io.to(room).emit('coords', color, {x: ROOMS.get(room)[color].x, y: ROOMS.get(room)[color].y})
               })

               // generate map
               const map = ROOMS.get(room).map
               for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
                  map[y] = []
                  for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
                     if (y % 2 == 1 && x % 2 == 1)
                        map[y][x] = false
                     else {
                        let canDraw = true;
                        [
                           [0, 0], [0, 1], [1, 0],
                           [0, BLOCKS_HORIZONTALLY-2], [0, BLOCKS_HORIZONTALLY-1], [1, BLOCKS_HORIZONTALLY-1],
                           [BLOCKS_VERTICALLY-2, 0], [BLOCKS_VERTICALLY-1, 0], [BLOCKS_VERTICALLY-1, 1],
                           [BLOCKS_VERTICALLY-2, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-2]
                        ].forEach(coord => {
                           if (y == coord[0] && x == coord[1])
                              canDraw = false
                        })

                        if (!canDraw)
                           map[y][x] = false
                        else
                           map[y][x] = (Math.random() < .7)
                     }
                  }
               }
               io.to(room).emit('map', map)

            }, 1000)
         }, 1000)
      }, 1000)
   })


   socket.on('selectColor', (newColor, callback) => {
      if (!detailsOkCheck())
         return
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'selectColor: Room is not in WAITING status.')
      
      if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
         return socket.emit('error', 'selectColor: invalid color.')
      
      if (newColor !== 'spectator' && ROOMS.get(room)[newColor].username)
         return socket.emit('error', 'selectColor: color already taken.')
      
      if (color !== 'spectator')
         ROOMS.get(room)[color] = {username: undefined, x: INEXISTENT_POS.x, y: INEXISTENT_POS.y}
      if (newColor !== 'spectator')
         ROOMS.get(room)[newColor] = {username: username, x: DEFAULT_POS[newColor].x, y: DEFAULT_POS[newColor].y}

      color = IDS.get(socket.id).color = newColor
      io.to(room).emit('player~', username, username, color, isOwner)

      callback()
   })


   socket.on('coords', (coords) => {
      if (!detailsOkCheck())
         return
      
      // check suspicious coords maybe ...

      socket.to(room).emit('coords', color, coords)
      ROOMS.get(room)[color].x = coords.x
      ROOMS.get(room)[color].y = coords.y
   })


   socket.on('disconnect', () => {
      if (!username || !room)
         return
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      
      IDS.delete(socket.id)
      socket.to(room).emit('player-', username)
      if (!io.sockets.adapter.rooms.get(room)) { // room empty
         ROOMS.delete(room)
      }
      else {
         if (color !== 'spectator') {
            if (ROOMS.get(room).status !== ROOM_STATUS.WAITING) {
               io.to(room).emit('coords', color, INEXISTENT_POS)
               ROOMS.get(room)[color] = {username: undefined, x: INEXISTENT_POS.x, y: INEXISTENT_POS.y}
            } else {
               io.to(room).emit('coords', color, DEFAULT_POS[color])
               ROOMS.get(room)[color] = {username: undefined, x: DEFAULT_POS[color].x, y: DEFAULT_POS[color].y}
            }
         }
      }
   })
})