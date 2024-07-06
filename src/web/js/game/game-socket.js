'use strict';

const protocol = (window.location.hostname==='localhost' || window.location.hostname.startsWith('192.168.0.') ? 'http' : 'https');
const socket = io(
   `${protocol}://${window.location.hostname}:22822`
);


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

   if (msg === ROOM_STATUS.RUNNING) {
      if (myColor !== 'spectator')
         CAN_MOVE = true;
      sounds.menu.stop();
   }

   if (msg === ROOM_STATUS.RUNNING) {
      END_SCREEN = null;
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


socket.on('shield0', (color) => {
   shields[color] = false;
})

socket.on('shield1', (color) => {
   shields[color] = true;
})


socket.on('death', (color) => {
   if (myColor === color) {
      me = { ...INEXISTENT_POS };
      CAN_MOVE = false;
   }
   sounds.dead[Math.floor(Math.random() * sounds.dead.length)].play();
   coords[color] = { ...INEXISTENT_POS };
})


socket.on('C', (coordsReceived) => {
   ['white', 'black', 'orange', 'green'].forEach((color, idx) => {
      if (color === myColor) {
         return;
      }
      let animState = 'idle';
      if (coordsReceived[idx][2] === 1) {
         animState = 'front';
      } else if (coordsReceived[idx][2] === 2) {
         animState = 'back';
      } else if (coordsReceived[idx][2] === 3) {
         animState = 'left';
      } else if (coordsReceived[idx][2] === 4) {
         animState = 'right';
      }

      coords[color].x = coordsReceived[idx][0];
      coords[color].y = coordsReceived[idx][1];
      sprites.players[color].state = animState;
   });
})

socket.on('coords', (color, coords1, animState) => {
   if (!animState)   animState = 'idle';
   coords[color] = coords1;
   sprites.players[color].state = animState;
})


socket.on('map', (map1) => { // a 2d array
   map = map1;
})

socket.on('mapUpdates', (blocks) => {
   let anyNewFires = false; // maybe you can play each sound for each bomb exploded. not a big difference but yeah.

   blocks.forEach(({x, y, block, details}) => {
      if (block === BLOCK.BOMB)
         if (details.sick)
            sounds.dropBombSick.play();
         else
            sounds.dropBomb.play();
      
      if (block === BLOCK.FIRE)
         anyNewFires = true;

      if (isPowerup(map[y][x]) && block === BLOCK.NO)
         sounds.powerup.play();
      
      map[y][x] = block;
   });

   if (anyNewFires)
      sounds.explodeBomb[Math.floor(Math.random() * sounds.explodeBomb.length)].play();
})


socket.on('gameTime', (time) => {
   gameTime = time;

   if (time === 5)
      sounds.hurry[0].play();
   if (time === 3)   
      sounds.hurry[Math.floor(Math.random() * (sounds.hurry.length - 1)) + 1].play();
   
   if (time % 20 === 16)
      sounds.taunt[Math.floor(Math.random() * sounds.taunt.length)].play();
})


socket.on('playsound', (sound) => {
   sounds[sound].play();
})


socket.on('endscreen', (color, ranking) => {
   if (!color) {
      addLog('Draw! Press \'Start game\' to play again.');
      sounds.draw[Math.floor(Math.random() * sounds.draw.length)].play();
   }
   else {
      addLog(`${color.slice(0, 1).toUpperCase() + color.slice(1)} won! Press \'Start game\' to play again.`);
      sounds.win[Math.floor(Math.random() * sounds.win.length)].play();
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
   addLog(`ERROR FROM SERVER: ${msg}`);
   console.error(`ERROR FROM SERVER: ${msg}`);
})