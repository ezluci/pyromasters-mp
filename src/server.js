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
const BLOCK_SAFE_PX = 7
const MOVE_SPEED = 0.15 // default 0.15 maybe
const FIRE_TIME = 400 // default 400 maybe
const BOMB_TIME = 4000

const MIN_X = 0
const MIN_Y = 0
const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1)
const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1)

const BLOCK = {
   NO: 0,   // nothing
   NORMAL: 1,  // a block that can be destroyed with bombs
   FIXED: 2,   // a block that cannot be destroyed
   BOMB: 3, // a bomb
   FIRE: 4  // fire from bomb
}

const INEXISTENT_POS = {x: -10000, y: -10000}
const DEFAULT_POS = {
   white: {x: MIN_X, y: MIN_Y}, black: {x: MAX_X, y: MAX_Y},
   orange: {x: MAX_X, y: MIN_Y}, green: {x: MIN_X, y: MAX_Y},
   spectator: INEXISTENT_POS
}


const io = new socketio.Server(server)

const ROOMS = new Map() // info about all rooms


io.on('connection', (socket) => {

   let username, room, color, isOwner, map

   function detailsOkCheck() {
      if (!username) {
         socket.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted. DISCONNECTED.')
         socket.disconnect()
         return false
      }
      return true
   }

   function onFireCheck(color) {
      const x = ROOMS.get(room)[color].coords.x
      const y = ROOMS.get(room)[color].coords.y
      
      let deadlyBlock1 = Object.assign(INEXISTENT_POS)
      let deadlyBlock2 = Object.assign(INEXISTENT_POS)

      if (x % BLOCK_SIZE === 0 && y % BLOCK_SIZE === 0) {
         deadlyBlock1 = {x: x / BLOCK_SIZE, y: y / BLOCK_SIZE}
      }
      else if (x % BLOCK_SIZE === 0) {
         const mod = y % BLOCK_SIZE
         
         if (mod > BLOCK_SIZE - BLOCK_SAFE_PX || mod < BLOCK_SAFE_PX) {
            if (mod < BLOCK_SAFE_PX)
               deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE)}
            else
               deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE) + 1}
         } else {
            deadlyBlock1 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE)}
            deadlyBlock2 = {x: x / BLOCK_SIZE, y: Math.floor(y / BLOCK_SIZE) + 1}
         }
      } else if (y % BLOCK_SIZE === 0) {
         const mod = x % BLOCK_SIZE
         
         if (mod > BLOCK_SIZE - BLOCK_SAFE_PX || mod < BLOCK_SAFE_PX) {
            if (mod < BLOCK_SAFE_PX)
               deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE), y: y / BLOCK_SIZE}
            else
               deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE) + 1, y: y / BLOCK_SIZE}
         } else {
            deadlyBlock1 = {x: Math.floor(x / BLOCK_SIZE), y: y / BLOCK_SIZE}
            deadlyBlock2 = {x: Math.floor(x / BLOCK_SIZE) + 1, y: y / BLOCK_SIZE}
         }
      } else {
         console.log('?????/')
      }

      return ((map[deadlyBlock1.y][deadlyBlock1.x] === BLOCK.FIRE) ||
            (deadlyBlock2.x !== INEXISTENT_POS.x && map[deadlyBlock2.y][deadlyBlock2.x] === BLOCK.FIRE))
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
            white: {username: undefined, coords: Object.assign(DEFAULT_POS['white']), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false},
            black: {username: undefined, coords: Object.assign(DEFAULT_POS['black']), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false},
            orange: {username: undefined, coords: Object.assign(DEFAULT_POS['orange']), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false},
            green: {username: undefined, coords: Object.assign(DEFAULT_POS['green']), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false},
            map: map,
            players: new Map(),
            status: ROOM_STATUS.WAITING
         })
      }
      
      map = ROOMS.get(room).map

      ROOMS.get(room).players.set(username, {color, isOwner, coords: Object.assign(INEXISTENT_POS)})

      // TODO: what if the owner leaves?
      
      console.log(`connected:    ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)
      
      socket.join(room)
      socket.to(room).emit('player+', username, color, isOwner)

      const players1 = []
      ROOMS.get(room).players.forEach(({color, isOwner, coords}, username) => {
         players1.push({username, color, isOwner, coords})
      })

      callback(players1, ROOMS.get(room).map)
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
                  if (!ROOMS.get(room)[color].selected)
                     ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS)
                  else {
                     ROOMS.get(room)[color].coords = Object.assign(DEFAULT_POS[color])
                     ROOMS.get(room).players.get(ROOMS.get(room)[color].username).coords = Object.assign(DEFAULT_POS[color])
                  }
                  
                  io.to(room).emit('coords', color, ROOMS.get(room)[color].coords)
               })

               // generate map
               for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
                  for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
                     if (y % 2 == 1 && x % 2 == 1) {
                        map[y][x] = BLOCK.FIXED
                     } else {
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
                           map[y][x] = BLOCK.NO
                        else
                           map[y][x] = (Math.random() < .67 ? BLOCK.NORMAL : BLOCK.NO)
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
      
      if (newColor !== 'spectator' && ROOMS.get(room)[newColor].selected)
         return socket.emit('error', 'selectColor: color already taken.')
      
      if (color !== 'spectator') {
         ROOMS.get(room)[color] = {username: undefined, coords: Object.assign(DEFAULT_POS[color]), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false}
         io.to(room).emit('coords', color, Object.assign(DEFAULT_POS[color]))
      }
      if (newColor !== 'spectator') {
         ROOMS.get(room)[newColor] = {username, coords: Object.assign(DEFAULT_POS[newColor]), bombs: 1, bombTime: 4000, bombRadius: 2, dead: false, selected: true}
         io.to(room).emit('coords', newColor, Object.assign(DEFAULT_POS[newColor]))
      }
      ROOMS.get(room).players.get(username).color = newColor

      color = newColor
      io.to(room).emit('player~', username, username, color, isOwner)

      callback()
   })


   socket.on('try_placeBomb', (x, y) => {
      if (!detailsOkCheck())
         return
      
      if ( !(0 <= x && x <= BLOCKS_HORIZONTALLY && 0 <= y && y <= BLOCKS_VERTICALLY) )
         return socket.emit('error', 'try_placeBomb: x or y out of range.')
      
      if (map[y][x] === BLOCK.BOMB || map[y][x] === BLOCK.FIXED || map[y][x] === BLOCK.NORMAL)
         return
      
      if (ROOMS.get(room)[color].bombs === 0)
         return // no bombs left
      
      io.to(room).emit('mapUpdates', [{x, y, block: BLOCK.BOMB}])
      map[y][x] = BLOCK.BOMB
      ROOMS.get(room)[color].bombs --

      setTimeout(() => {
         const fires = []
         fires.push({x, y, block: BLOCK.FIRE})
         for (let yy = y-1; yy >= Math.max(0, y - ROOMS.get(room)[color].bombRadius); --yy) {
            if (map[yy][x] !== BLOCK.NORMAL && map[yy][x] !== BLOCK.NO)
               break
            if (map[yy][x] === BLOCK.NORMAL) {
               map[yy][x] = BLOCK.FIRE
               fires.push({x: x, y: yy, block: BLOCK.FIRE})
               break
            }
            if (map[yy][x] === BLOCK.NO) {
               map[yy][x] = BLOCK.FIRE
               fires.push({x: x, y: yy, block: BLOCK.FIRE})
            }
         }
         for (let yy = y+1; yy <= Math.min(BLOCKS_VERTICALLY-1, y + ROOMS.get(room)[color].bombRadius); ++yy) {
            if (map[yy][x] !== BLOCK.NORMAL && map[yy][x] !== BLOCK.NO)
               break
            if (map[yy][x] === BLOCK.NORMAL) {
               map[yy][x] = BLOCK.FIRE
               fires.push({x: x, y: yy, block: BLOCK.FIRE})
               break
            }
            if (map[yy][x] === BLOCK.NO) {
               map[yy][x] = BLOCK.FIRE
               fires.push({x: x, y: yy, block: BLOCK.FIRE})
            }
         }
         for (let xx = x-1; xx >= Math.max(0, x - ROOMS.get(room)[color].bombRadius); --xx) {
            if (map[y][xx] !== BLOCK.NORMAL && map[y][xx] !== BLOCK.NO)
               break
            if (map[y][xx] === BLOCK.NORMAL) {
               map[y][xx] = BLOCK.FIRE
               fires.push({x: xx, y: y, block: BLOCK.FIRE})
               break
            }
            if (map[y][xx] === BLOCK.NO) {
               map[y][xx] = BLOCK.FIRE
               fires.push({x: xx, y: y, block: BLOCK.FIRE})
            }
         }
         for (let xx = x+1; xx <= Math.min(BLOCKS_HORIZONTALLY-1, x + ROOMS.get(room)[color].bombRadius); ++xx) {
            if (map[y][xx] !== BLOCK.NORMAL && map[y][xx] !== BLOCK.NO)
               break
            if (map[y][xx] === BLOCK.NORMAL) {
               map[y][xx] = BLOCK.FIRE
               fires.push({x: xx, y: y, block: BLOCK.FIRE})
               break
            }
            if (map[y][xx] === BLOCK.NO) {
               map[y][xx] = BLOCK.FIRE
               fires.push({x: xx, y: y, block: BLOCK.FIRE})
            }
         }

         io.to(room).emit('mapUpdates', fires);

         ['white', 'black', 'orange', 'green'].forEach(color => {
            if (!ROOMS.get(room)[color].selected)
               return
            if (ROOMS.get(room)[color].dead)
               return
            
            if (ROOMS.get(room).status === ROOM_STATUS.RUNNING && onFireCheck(color)) {
               io.to(room).emit('death', color)

               ROOMS.get(room)[color].dead = true
               ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS)
               ROOMS.get(room).players.get(username).coords = Object.assign(INEXISTENT_POS)
            }
         })

         setTimeout(() => {
            fires.forEach((fire) => {
               fire.block = BLOCK.NO
               map[fire.y][fire.x] = BLOCK.NO
            })

            io.to(room).emit('mapUpdates', fires)
            ROOMS.get(room)[color].bombs ++
         }, FIRE_TIME)

      }, ROOMS.get(room)[color].bombTime)
   })


   // implement anti-cheat maybe ...
   socket.on('coords', (coords) => {
      if (!detailsOkCheck())
         return
      
      if (color === 'spectator')
         return socket.emit('error', 'coords: You are a spectator.')
      
      if (ROOMS.get(room)[color].dead)
         return socket.emit('error', 'coords: Player is \'dead\'')

      if (ROOMS.get(room).status === ROOM_STATUS.RUNNING && onFireCheck(color)) {
         io.to(room).emit('death', color)
         ROOMS.get(room)[color].dead = true
         ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS)
         ROOMS.get(room).players.get(username).coords = Object.assign(INEXISTENT_POS)
         return
      }

      io.to(room).emit('coords', color, coords)
      ROOMS.get(room)[color].coords = coords
      ROOMS.get(room).players.get(username).coords = coords
   })


   socket.on('disconnect', () => {
      if (!username || !room)
         return
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`)

      socket.to(room).emit('player-', username)
      ROOMS.get(room).players.delete(username)

      if (!io.sockets.adapter.rooms.get(room)) { // room empty
         ROOMS.delete(room)
      }
      else {
         if (color !== 'spectator') {
            if (ROOMS.get(room).status !== ROOM_STATUS.WAITING) {
               io.to(room).emit('coords', color, INEXISTENT_POS)
               ROOMS.get(room)[color] = {username: undefined, coords: Object.assign(INEXISTENT_POS), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false}
            } else {
               io.to(room).emit('coords', color, DEFAULT_POS[color])
               ROOMS.get(room)[color] = {username: undefined, coords: Object.assign(DEFAULT_POS[color]), bombs: 0, bombTime: 4000, bombRadius: 2, dead: true, selected: false}
            }
         }
      }
   })
})