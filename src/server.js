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

const BLOCK = {
   NO: 0,   // nothing
   NORMAL: 1,  // a block that can be destroyed with bombs
   FIXED: 2,   // a block that cannot be destroyed
   BOMB: 3  // a bomb
}

const INEXISTENT_POS = {x: -100, y: -100}
const DEFAULT_POS = {
   white: {x: MIN_X, y: MIN_Y}, black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y}, green: {x: MIN_X, y: MAX_Y},
   spectator: INEXISTENT_POS
}


const io = new socketio.Server(server)

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
         const map = []
         for (let i = 0; i < BLOCKS_VERTICALLY; ++i) {
            map[i] = []
            for (let j = 0; j < BLOCKS_HORIZONTALLY; ++j) {
               if (i % 2 == 1 && j % 2 == 1)
                  map[i][j] = BLOCK.FIXED
               else
                  map[i][j] = BLOCK.NO
            }
         }
            

         ROOMS.set(room, {
            owner: username,
            white: {username: undefined, coords: DEFAULT_POS['white'], bombs: 0}, // "bombs" not used
            black: {username: undefined, coords: DEFAULT_POS['black'], bombs: 0},
            orange: {username: undefined, coords: DEFAULT_POS['orange'], bombs: 0},
            green: {username: undefined, coords: DEFAULT_POS['green'], bombs: 0},
            map: map,
            players: [],
            status: ROOM_STATUS.WAITING
         })
      }

      ROOMS.get(room).players.push({username, color, isOwner, coords: INEXISTENT_POS, bombs: 0})

      // TODO: what if the owner leaves?
      
      console.log(`connected:    ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      
      socket.join(room)
      socket.to(room).emit('player+', username, color, isOwner)

      callback(ROOMS.get(room).players, ROOMS.get(room).map)
   })


   socket.on('tryStart', () => {
      if (!detailsOkCheck())
         return
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'tryStart: Room is not in WAITING status.')
      
      if (!isOwner)
         return socket.emit('error', 'tryStart: You are not the owner of this room!')

      ROOMS.get(room).status = ROOM_STATUS.STARTING
      
      // bug: start game, wait a sec, reenter the room. the countdown should be stopped but it's still going.
      io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 3`)
      setTimeout(() => {
         io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 2`)
         setTimeout(() => {
            io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 1`)
            setTimeout(() => {

               /// GAME STARTS HERE!

               io.to(room).emit('room_status', `game running.`)
               ROOMS.get(room).status = ROOM_STATUS.RUNNING;

               // set coordinates for each color
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (ROOMS.get(room)[color].username === undefined)
                     ROOMS.get(room)[color].coords = INEXISTENT_POS
                  else
                     ROOMS.get(room)[color].coords = DEFAULT_POS[color]
                  
                  io.to(room).emit('coords', color, ROOMS.get(room)[color])
               })

               // generate map
               const map = ROOMS.get(room).map
               for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
                  for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
                     if ( !(y % 2 == 1 && x % 2 == 1) ) {
                        let canDraw = true;
                        [
                           [0, 0], [0, 1], [1, 0],
                           [0, BLOCKS_HORIZONTALLY-2], [0, BLOCKS_HORIZONTALLY-1], [1, BLOCKS_HORIZONTALLY-1],
                           [BLOCKS_VERTICALLY-2, 0], [BLOCKS_VERTICALLY-1, 0], [BLOCKS_VERTICALLY-1, 1],
                           [BLOCKS_VERTICALLY-2, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-2]
                        ].forEach(coordBlocked => {
                           if (y == coordBlocked[0] && x == coordBlocked[1])
                              canDraw = false
                        })

                        if (!canDraw)
                           map[y][x] = false
                        else
                           map[y][x] = (Math.random() < .67)
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
      
      if (color !== 'spectator') {
         ROOMS.get(room)[color] = {username: undefined, coords: DEFAULT_POS[color], bombs: 1}
         io.to(room).emit('coords', color, DEFAULT_POS[color])
      }
      if (newColor !== 'spectator')
         ROOMS.get(room)[newColor] = {username, coords: DEFAULT_POS[newColor], bombs: 1}
      ROOMS.get(room).players.filter(player => player.username === username)[0].color = newColor

      color = newColor
      io.to(room).emit('player~', username, username, color, isOwner)

      callback()
   })


   socket.on('bomb_placed', (x, y) => {
      socket.to(room).emit('bomb_placed', x, y)
   })


   socket.on('coords', (coords) => {
      if (!detailsOkCheck())
         return
      
      if (color === 'spectator')
         return socket.emit('error', 'coords: You are a spectator.')
      
      // check suspicious coords maybe ...

      socket.to(room).emit('coords', color, coords)
      ROOMS.get(room)[color].coords = coords
      ROOMS.get(room).players.filter(player => player.username === username)[0].coords = coords
   })


   socket.on('disconnect', () => {
      if (!username || !room)
         return
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)

      socket.to(room).emit('player-', username)
      ROOMS.get(room).players.forEach((player, idx) => {
         if (player.username === username)
            ROOMS.get(room).players.splice(idx, 1)
      })

      if (!io.sockets.adapter.rooms.get(room)) { // room empty
         ROOMS.delete(room)
      }
      else {
         if (color !== 'spectator') {
            if (ROOMS.get(room).status !== ROOM_STATUS.WAITING) {
               io.to(room).emit('coords', color, INEXISTENT_POS)
               ROOMS.get(room)[color] = {username: undefined, coords: INEXISTENT_POS}
            } else {
               io.to(room).emit('coords', color, DEFAULT_POS[color])
               ROOMS.get(room)[color] = {username: undefined, coords: DEFAULT_POS[color]}
            }
         }
      }
   })
})