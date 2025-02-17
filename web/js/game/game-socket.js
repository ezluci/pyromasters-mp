'use strict';

const protocol = (window.location.hostname==='localhost' || window.location.hostname.startsWith('192.168.0.') ? 'http' : 'https');
let socket;

document.addEventListener('socket-loaded', function() {



console.log(socket);


socket.on('initial_info', (players, mapName, map1, roomStatus, playersAlive) => {
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
      map[y] = [];
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         if (map1.length !== 0) {
            map[y][x] = map1[y][x];
         } else {
            map[y][x] = BLOCK.NO;
         }
      }
   }
   if (mapName === 'testmap:)') {
      mapName = 'bricktown';
   }
   MAP_NAME = mapName;
   
   players.forEach( ({name, color, isOwner}) => {
      addPlayerToList(name, color, isOwner)
   });
   
   ['white', 'black', 'orange', 'green'].forEach(color => {
      coords[color].alive = false;
   });
   playersAlive.forEach(color => {
      coords[color].alive = true;
   });

   document.dispatchEvent( new CustomEvent('mapnamechange') );
});

socket.on('player+', (username, color, isOwner) => {
   addPlayerToList(username, color, isOwner);
})

socket.on('player-', (username) => {
   removePlayerFromList(username);
})

socket.on('player~', (oldUsername, username, color, isOwner) => {
   changePlayerFromList(oldUsername, username, color, isOwner);

   if (username === usernameHTML) {
      myColor = color;
   }
})


socket.on('room_status', (msg) => {
   document.querySelector('#room-status').innerText = 'room status: ' + msg;
   const selectColorsEl = document.querySelector('#select-color');
   const selectMapEl = document.querySelector('#select-map');
   const canvasEl = document.querySelector('#canvas');

   switch (msg) {
      case ROOM_STATUS.WAITING:
         selectColorsEl.hidden = false;
         selectMapEl.hidden = false;
         break;
      case ROOM_STATUS.STARTING:
         selectColorsEl.hidden = true;
         selectMapEl.hidden = true;
         canvasEl.hidden = false;
         break;
      case ROOM_STATUS.RUNNING:
         selectColorsEl.hidden = true;
         selectMapEl.hidden = true;
         canvasEl.hidden = false;
         CAN_MOVE = (myColor !== 'spectator');
         END_SCREEN = null;
         break;
   }
})


socket.on('speedUpdate', (newSpeed) => {
   moveSpeed = newSpeed;
})


socket.on('switchKeys', () => {
   switchedKeys++;
   if (switchedKeys === 1) {
      document.dispatchEvent(new CustomEvent('switchkeyschange'));
   }

   setTimeout(() => {
      switchedKeys--;
      if (switchedKeys === 0) {
         document.dispatchEvent(new CustomEvent('switchkeyschange'));
      }
   }, 10000);
})


socket.on('shield', (color, value) => {
   shields[color] = value;
})


socket.on('death', (color) => {
   if (myColor === color) {
      CAN_MOVE = false;
   }
   coords[color].alive = false;
})

socket.on('playersAlive', (playersAlive) => {
   playersAlive.forEach(color => {
      coords[color].alive = true;
   });
});


// these are coords received on every server tick.
// ignores the coords for myColor.
socket.on('C', (coordsReceived) => {
   ['white', 'black', 'orange', 'green'].forEach((color, idx) => {
      if (color === myColor) {
         return;
      }
      
      let animState;
      if (typeof coordsReceived[idx][2] === 'string')
         animState = coordsReceived[idx][2];
      if (!animState)   animState = 'idle';

      if (sprites.players[color].state !== animState) {
         changeAnimation(color, animState);
      }

      coords[color].x = coordsReceived[idx][0];
      coords[color].y = coordsReceived[idx][1];
   });
})

// this event updates the coords, no matter what.
// it doesn't check myColor.
socket.on('coords', (color, coords1, animState) => {
   if (!animState)   animState = 'idle';
   coords[color].x = coords1.x;
   coords[color].y = coords1.y;
   if (sprites.players[color].state !== animState) {
      changeAnimation(color, animState);
   }
})


socket.on('mapName', (mapName) => {
   if (mapName === 'testmap:)') {
      mapName = 'bricktown';
   }
   MAP_NAME = mapName;
   document.dispatchEvent( new CustomEvent('mapnamechange') );
});

socket.on('mapUpdates', (updates) => {
   updates.forEach(({x, y, block}) => {
      map[y][x] = block;
   });
});

socket.on('addBomb', (bombId, x, y) => {
   bombs.push({x, y, bombId});
});
socket.on('deleteBomb', (bombId) => {
   const index = bombs.findIndex(bomb => bomb.bombId === bombId);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
});
socket.on('updateBomb', (bombId, x, y) => {
   const index = bombs.findIndex(bomb => bomb.bombId === bombId);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
   bombs.push({x, y, bombId});
});

socket.on('addBombfire', (x, y) => {
   bombfires.push({x, y});
});
socket.on('deleteBombfire', (x, y) => {
   const index = bombfires.findIndex(bombfire => bombfire.x === x && bombfire.y === y);
   if (index !== -1) {
      bombfires.splice(index, 1);
   }
});


socket.on('gameTime', (time) => {
   gameTime = time;
})

let menu_soundId;

socket.on('playsound', (soundName) => {
   console.log(soundName);
   const id = audio.play(soundName);

   if (soundName === 'draw' || soundName.startsWith('draw_') ||
         soundName === 'win' || soundName.startsWith('win_')) {
      audio.on('end', () => {
         menu_soundId = audio.play('menu');
         audio.loop(true, menu_soundId);
      }, id);
   }

   if (soundName === 'menu') {
      menu_soundId = id;
      audio.loop(true, menu_soundId);
   }
})

socket.on('stopmenusound', () => {
   if (menu_soundId) {
      audio.stop(menu_soundId);
      menu_soundId = undefined;
   }
});


socket.on('endscreen', (color, ranking) => {
   document.querySelector('#canvas').hidden = false;
   if (!color) {
      addLog('Draw! Press \'Start game\' to play again.');
   } else {
      addLog(`${color.slice(0, 1).toUpperCase() + color.slice(1)} won! Press \'Start game\' to play again.`);
   }

   if (color === null)
      END_SCREEN = 'draw';
   else
      END_SCREEN = color;
   RANKING = ranking;
})


socket.on('chat', (username, msg) => {
   addChatMessage(username, msg);
});


socket.on('error', (msg) => {
   addLog(`ERROR: ${msg}`);
   console.error(`ERROR: ${msg}`);
})





   
});