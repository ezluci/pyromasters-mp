'use strict';

const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const URL = require('node:url')
const path = require('node:path')
const fs = require('node:fs')
const { ILLNESS_TIME } = require('../client/js/game/consts')

const server = http.createServer((req, res) => {
   const reqURL = new URL.URL(req.url, 'a://a.a')
   if (reqURL.pathname === '/' || reqURL.pathname === '')
      reqURL.pathname = 'index.html'
   const reqPath = path.join(__dirname, '..', 'client', reqURL.pathname)
   
   fs.readFile(reqPath, (err, data) => {
      if (err instanceof Error)
         res.end('404')
      else
         res.end(data)
   })
}).listen(parseInt(PORT), () => { console.log(`The server works on port ${PORT}.`) })

const {
   OFFSET_LEFT, OFFSET_RIGHT, OFFSET_UP, OFFSET_DOWN,
   BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, BLOCK_SIZE, BLOCK_SAFE_PX, MOVE_SPEEDS, FIRE_TIME, BOMB_TIMES,
   MIN_X, MIN_Y, MAX_X, MAX_Y,
   BLOCK,
   INEXISTENT_POS, DEFAULT_POS,
   ROOM_STATUS
} = require('./consts')()

// returns true if you CANNOT GO through this block
function stop(blockCode) {
   return (blockCode !== BLOCK.NO && blockCode !== BLOCK.FIRE && blockCode !== BLOCK.BOMB && !isPowerup(blockCode))
}

function isPowerup(blockCode) {
   return 5 <= blockCode && blockCode <= 13
}


const io = new socketio.Server(server)

const ROOMS = new Map() // info about all rooms


io.on('connection', (socket) => {

   let username, room, color, isOwner, map
   let tryPlaceBombFunc


   function detailsOkCheck() {
      if (!username) {
         socket.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted, or the server was restarted mid-game. DISCONNECTED.')
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


   function collectPowerup(x, y) {
      if ( !(0 <= x && x < BLOCKS_HORIZONTALLY && 0 <= y && y < BLOCKS_VERTICALLY) )
         return;
      
      if (!isPowerup(map[y][x]))
         return

      if (map[y][x] === BLOCK.POWER_BOMBPLUS) {
         if (ROOMS.get(room)[color].bombs < 4)
            ROOMS.get(room)[color].bombs ++
      }
      else if (map[y][x] === BLOCK.POWER_BOMBLENGTH) {
         ROOMS.get(room)[color].bombLength += 2
      }
      else if (map[y][x] === BLOCK.POWER_SPEED) {
         if (ROOMS.get(room)[color].moveSpeedIndex < MOVE_SPEEDS.length - 1) {
            ROOMS.get(room)[color].moveSpeedIndex ++
            socket.emit('speedUpdate', MOVE_SPEEDS[ROOMS.get(room)[color].moveSpeedIndex])
         }
      }
      else if (map[y][x] === BLOCK.POWER_SHIELD) { // wip
         
      }
      else if (map[y][x] === BLOCK.POWER_KICKBOMBS) { // wip
         
      }
      else if (map[y][x] === BLOCK.POWER_BOMBTIME) {
         if (ROOMS.get(room)[color].bombTimeIndex < BOMB_TIMES.length - 1) {
            ROOMS.get(room)[color].bombTimeIndex ++
         }
      }
      else if (map[y][x] === BLOCK.POWER_SWITCHPLAYER) { // wip
         
      }
      else if (map[y][x] === BLOCK.POWER_ILLNESS) {
         const rand = Math.floor(Math.random() * 2)
         
         switch (rand) {
            case 0:
               socket.emit('switchKeys')
               break
            case 1:
               ROOMS.get(room)[color].sick = true
               tryPlaceBombFunc()
               setTimeout(() => {
                  if (ROOMS.get(room)?.[color]?.selected)
                     ROOMS.get(room)[color].sick = false
               }, ILLNESS_TIME)
               break
         }
      }
      else if (map[y][x] === BLOCK.POWER_BONUS) { // wip
         
      }
   
      io.to(room).emit('mapUpdates', [{x, y, block: BLOCK.NO}])
      map[y][x] = BLOCK.NO
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
            white: {username: undefined, coords: Object.assign(DEFAULT_POS['white']), bombs: 0, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: true, selected: false},
            black: {username: undefined, coords: Object.assign(DEFAULT_POS['black']), bombs: 0, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: true, selected: false},
            orange: {username: undefined, coords: Object.assign(DEFAULT_POS['orange']), bombs: 0, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: true, selected: false},
            green: {username: undefined, coords: Object.assign(DEFAULT_POS['green']), bombs: 0, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: true, selected: false},
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
      ROOMS.get(room).players.forEach(({color, isOwner}, username) => {
         players1.push({username, color, isOwner})
      })
      
      const colorsCoords = {};
      ['white', 'black', 'orange', 'green'].forEach(color => {
         colorsCoords[color] = ROOMS.get(room)[color].coords
      })

      callback(players1, colorsCoords, ROOMS.get(room).map)
   })


   socket.on('tryStart', () => {
      if (!detailsOkCheck())
         return;
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'tryStart: Room is not in WAITING status.');
      
      if (!isOwner)
         return socket.emit('error', 'tryStart: You are not the owner of this room!');

      ROOMS.get(room).status = ROOM_STATUS.STARTING;
      
      io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 3`);
      setTimeout(() => {
         io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 2`);
         setTimeout(() => {
            io.to(room).emit('room_status', `'${username}' started the countdown. game starts in 1`);
            setTimeout(() => {

               /// GAME STARTS HERE!

               io.to(room).emit('room_status', `game running.`);
               ROOMS.get(room).status = ROOM_STATUS.RUNNING;

               // set coordinates for each color
               ['white', 'black', 'orange', 'green'].forEach(color => {
                  if (ROOMS.get(room)[color].selected === false) {
                     ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS);
                  } else {
                     ROOMS.get(room)[color].coords = Object.assign(DEFAULT_POS[color]);
                     ROOMS.get(room)[color].bombs = 1;
                     ROOMS.get(room).players.get(ROOMS.get(room)[color].username).coords = Object.assign(DEFAULT_POS[color]);
                  }
                  io.to(room).emit('coords', color, ROOMS.get(room)[color].coords);
               })

               // generate map
               for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
                  for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
                     if (y % 2 == 1 && x % 2 == 1) {
                        map[y][x] = BLOCK.FIXED;
                     } else {
                        let canDraw = true;
                        [
                           [0, 0], [0, 1], [1, 0],
                           [0, BLOCKS_HORIZONTALLY-2], [0, BLOCKS_HORIZONTALLY-1], [1, BLOCKS_HORIZONTALLY-1],
                           [BLOCKS_VERTICALLY-2, 0], [BLOCKS_VERTICALLY-1, 0], [BLOCKS_VERTICALLY-1, 1],
                           [BLOCKS_VERTICALLY-2, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-1], [BLOCKS_VERTICALLY-1, BLOCKS_HORIZONTALLY-2]
                        ].forEach(coordBlocked => {
                           if (y == coordBlocked[0] && x == coordBlocked[1])
                              canDraw = false;
                        })

                        if (!canDraw)
                           map[y][x] = BLOCK.NO;
                        else
                           map[y][x] = (Math.random() < .67 ? BLOCK.NORMAL : BLOCK.NO);
                     }
                  }
               }

               io.to(room).emit('map', map);
            }, 1000);
         }, 1000);
      }, 1000);
   })


   socket.on('selectColor', (newColor, callback) => {
      if (!detailsOkCheck())
         return;
      
      if (ROOMS.get(room).status !== ROOM_STATUS.WAITING)
         return socket.emit('error', 'selectColor: Room is not in WAITING status.');
      
      if (newColor !== 'spectator' && newColor !== 'white' && newColor !== 'black' && newColor !== 'orange' && newColor !== 'green')
         return socket.emit('error', 'selectColor: invalid color.');
      
      if (newColor !== 'spectator' && ROOMS.get(room)[newColor].selected)
         return socket.emit('error', 'selectColor: color already taken.');
      
      if (color !== 'spectator') {
         ROOMS.get(room)[color].coords = Object.assign(DEFAULT_POS[color]);
         ROOMS.get(room)[color].selected = false;
         io.to(room).emit('coords', color, Object.assign(DEFAULT_POS[color]));
      }
      if (newColor !== 'spectator') {
         ROOMS.get(room)[newColor] = {username, coords: Object.assign(DEFAULT_POS[newColor]), bombs: 1, bombTimeIndex: 0, bombLength: 2, moveSpeedIndex: 0, sick: false, dead: false, selected: true};
         io.to(room).emit('coords', newColor, Object.assign(DEFAULT_POS[newColor]));
      }
      ROOMS.get(room).players.get(username).color = newColor;

      color = newColor;
      io.to(room).emit('player~', username, username, color, isOwner);

      callback();
   })


   tryPlaceBombFunc = () => {
      if (!detailsOkCheck())
         return;
      
      if (color === 'spectator')
         return socket.emit('error', 'tryPlaceBomb: You are a spectator.');
      if (ROOMS.get(room)[color].dead)
         return socket.emit('error', 'tryPlaceBomb: Player is \'dead\'');
      
      const x = Math.round(ROOMS.get(room)[color].coords.x / BLOCK_SIZE);
      const y = Math.round(ROOMS.get(room)[color].coords.y / BLOCK_SIZE);
      
      if ( !(0 <= x && x <= BLOCKS_HORIZONTALLY && 0 <= y && y <= BLOCKS_VERTICALLY) )
         return socket.emit('error', 'tryPlaceBomb: x or y out of range.');
      
      if (map[y][x] === BLOCK.FIRE || map[y][x] === BLOCK.BOMB || map[y][x] === BLOCK.FIXED || map[y][x] === BLOCK.NORMAL)
         return;
      
      if (ROOMS.get(room)[color].bombs === 0)
         return; // no bombs left
      
      io.to(room).emit('mapUpdates', [{x, y, block: BLOCK.BOMB}]);
      map[y][x] = BLOCK.BOMB;
      ROOMS.get(room)[color].bombs --;

      const bombLength = ROOMS.get(room)[color].bombLength;
   
      setTimeout(() => {
         if (! ROOMS.get(room))
            return;
         
         const fires = [];

         fires.push({x, y, block: BLOCK.FIRE, wasBlock: false});
         for (let yy = y-1; yy >= Math.max(0, y - bombLength); --yy) {
            if (map[yy][x] === BLOCK.NORMAL || map[yy][x] === BLOCK.NO || isPowerup(map[yy][x]))
               fires.push({x: x, y: yy, block: BLOCK.FIRE, wasBlock: (map[yy][x] === BLOCK.NORMAL)});
            if (stop(map[yy][x]) || isPowerup(map[yy][x]))
               break;
         }
         for (let yy = y+1; yy <= Math.min(BLOCKS_VERTICALLY-1, y + bombLength); ++yy) {
            if (map[yy][x] === BLOCK.NORMAL || map[yy][x] === BLOCK.NO || isPowerup(map[yy][x]))
               fires.push({x: x, y: yy, block: BLOCK.FIRE, wasBlock: (map[yy][x] === BLOCK.NORMAL)});
            if (stop(map[yy][x]) || isPowerup(map[yy][x]))
               break;
         }
         for (let xx = x-1; xx >= Math.max(0, x - bombLength); --xx) {
            if (map[y][xx] === BLOCK.NORMAL || map[y][xx] === BLOCK.NO || isPowerup(map[y][xx]))
               fires.push({x: xx, y: y, block: BLOCK.FIRE, wasBlock: (map[y][xx] === BLOCK.NORMAL)});
            if (stop(map[y][xx]) || isPowerup(map[y][xx]))
               break;
         }
         for (let xx = x+1; xx <= Math.min(BLOCKS_HORIZONTALLY-1, x + bombLength); ++xx) {
            if (map[y][xx] === BLOCK.NORMAL || map[y][xx] === BLOCK.NO || isPowerup(map[y][xx]))
               fires.push({x: xx, y: y, block: BLOCK.FIRE, wasBlock: (map[y][xx] === BLOCK.NORMAL)});
            if (stop(map[y][xx]) || isPowerup(map[y][xx]))
               break;
         }
   
         fires.forEach((fire) => {
            map[fire.y][fire.x] = BLOCK.FIRE;
         })
   
         io.to(room).emit('mapUpdates', fires);

         ['white', 'black', 'orange', 'green'].forEach(color => {
            if (! ROOMS.get(room)[color].selected || ROOMS.get(room)[color].dead)
               return;
            
            if (ROOMS.get(room).status === ROOM_STATUS.RUNNING && onFireCheck(color)) {
               io.to(room).emit('death', color);

               ROOMS.get(room)[color].dead = true;
               ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS);
               ROOMS.get(room).players.get(username).coords = Object.assign(INEXISTENT_POS);
            }
         })

         setTimeout(() => {
            if (! ROOMS.get(room))
               return;
            
            fires.forEach((fire) => {
               let newBlock;

               const rand = Math.floor(Math.random() * 18);
               if (fire.wasBlock === false || rand <= 7)
                  newBlock = BLOCK.NO;
               else {
                  const rand = Math.floor(Math.random() * 14);
                  if (rand === 0 || rand === 1 || rand === 2 || rand === 3)
                     newBlock = BLOCK.POWER_BOMBLENGTH;
                  else if (rand === 4)
                     newBlock = BLOCK.POWER_BOMBPLUS;
                  else if (rand === 5)
                     newBlock = BLOCK.POWER_BOMBTIME;
                  else if (rand === 6)
                     newBlock = BLOCK.POWER_KICKBOMBS;
                  else if (rand === 7 || rand === 8)
                     newBlock = BLOCK.POWER_SPEED;
                  else if (rand === 9)
                     newBlock = BLOCK.POWER_SHIELD;
                  else if (rand === 10)
                     newBlock = BLOCK.POWER_SWITCHPLAYER;
                  else if (rand === 11)
                     newBlock = BLOCK.POWER_ILLNESS;
                  else if (rand === 12 || rand === 13)
                     newBlock = BLOCK.POWER_BONUS;
               }
   
               fire.block = newBlock;
               map[fire.y][fire.x] = newBlock;
            })
   
            io.to(room).emit('mapUpdates', fires);
   
            if (! ROOMS.get(room)[color].selected || ROOMS.get(room)[color].dead)
               return;

            ROOMS.get(room)[color].bombs ++;

            // collect powerups
            const x = ROOMS.get(room)[color].coords.x;
            const y = ROOMS.get(room)[color].coords.y;
            collectPowerup(Math.floor(x / BLOCK_SIZE), Math.floor(y / BLOCK_SIZE));
            collectPowerup(Math.ceil(x / BLOCK_SIZE), Math.ceil(y / BLOCK_SIZE));

            // check if player is sick
            if (ROOMS.get(room)[color].sick)
               tryPlaceBombFunc();
         }, FIRE_TIME);

      }, BOMB_TIMES[ROOMS.get(room)[color].bombTimeIndex]);
   }

   socket.on('tryPlaceBomb', () => {
      if (ROOMS.get(room)[color].sick)
         return; // this will do the job
      tryPlaceBombFunc()
   })


   // implement anti-cheat maybe ...
   socket.on('coords', (coords) => {
      if (!detailsOkCheck())
         return;

      if (color === 'spectator')
         return socket.emit('error', 'coords: You are a spectator.');
      if (ROOMS.get(room)[color].dead)
         return socket.emit('error', 'coords: Player is \'dead\'');
   
      if (ROOMS.get(room).status === ROOM_STATUS.RUNNING && onFireCheck(color)) {
         io.to(room).emit('death', color);
         ROOMS.get(room)[color].dead = true;
         ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS);
         ROOMS.get(room).players.get(username).coords = Object.assign(INEXISTENT_POS);
         return;
      }
   
      socket.to(room).emit('coords', color, coords);
      ROOMS.get(room)[color].coords = coords;
      ROOMS.get(room).players.get(username).coords = coords;
   
      // check if player collected some powerup
      const x = ROOMS.get(room)[color].coords.x;
      const y = ROOMS.get(room)[color].coords.y;
      collectPowerup(Math.floor(x / BLOCK_SIZE), Math.floor(y / BLOCK_SIZE));
      collectPowerup(Math.ceil(x / BLOCK_SIZE), Math.ceil(y / BLOCK_SIZE));

      // check if player is sick
      if (ROOMS.get(room)[color].sick)
         tryPlaceBombFunc();
   })


   socket.on('disconnect', () => {
      if (!username || !room)
         return;
      
      console.log(`disconnected: ${socket.id}, {username: ${username}, room: ${room}, isOwner: ${isOwner}}`);

      socket.to(room).emit('player-', username);
      ROOMS.get(room).players.delete(username);

      if (!io.sockets.adapter.rooms.get(room)) { // room empty
         ROOMS.delete(room);
      } else {
         if (color !== 'spectator') {
            if (ROOMS.get(room).status !== ROOM_STATUS.WAITING) {
               io.to(room).emit('coords', color, INEXISTENT_POS);
               ROOMS.get(room)[color].coords = Object.assign(INEXISTENT_POS);
               ROOMS.get(room)[color].selected = false;
            } else {
               io.to(room).emit('coords', color, DEFAULT_POS[color]);
               ROOMS.get(room)[color].coords = Object.assign(DEFAULT_POS[color]);
               ROOMS.get(room)[color].selected = false;
            }
         }
      }
   })
})