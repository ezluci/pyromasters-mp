'use strict';

const socket = io();

socket.on('player+', (username, color, isOwner) => {
   addPlayerToList(username, color, isOwner);
})

socket.on('player-', (username) => {
   removePlayerFromList(username);
})

socket.on('player~', (oldUsername, username, color, isOwner) => {
   changePlayerFromList(oldUsername, username, color, isOwner);
})

socket.on('room_status', (msg) => {
   document.querySelector('#room-status').innerText = msg;
   if (msg === 'game running.')
      menuSound.stop();
})

socket.on('mapUpdates', (blocks) => {
   blocks.forEach(({x, y, block}) => {
      map[y][x] = block;
   });
})

socket.on('speedUpdate', (newSpeed) => {
   moveSpeed = newSpeed;
})

socket.on('switchKeys', () => {
   switchedKeys++;

   if (switchedKeys === 1) {
      switch (lastPressed) {
         case 'a':   lastPressed = 'd';   break;
         case 's':   lastPressed = 'w';   break;
         case 'd':   lastPressed = 'a';   break;
         case 'w':   lastPressed = 's';   break;
      }
   }

   setTimeout(() => { switchedKeys--; }, ILLNESS_TIME);
})

socket.on('shield0', (color) => {
   if (shields[color].timeout)
      clearTimeout(shields[color].timeout);
   
   shields[color].timeout = null;
   shields[color].val = false;
})

socket.on('shield1', (color) => {
   if (shields[color].timeout)
      clearTimeout(shields[color].timeout);
   
   shields[color].val = true;
   shields[color].timeout = setTimeout(() => {
      shields[color].val = false;
   }, SHIELD_TIME);
})

socket.on('switchPlayers', (color1, color2) => {
   [coords[color1], coords[color2]] = [coords[color2], coords[color1]];
})

socket.on('death', (color) => {
   if (myColor === color) {
      myColor = 'spectator';
      me = INEXISTENT_POS;
   }
   coords[color] = INEXISTENT_POS;
})

socket.on('coords', (color, coords1) => {
   coords[color] = coords1;
})

socket.on('map', (map1) => { // a 2d array
   map = map1;
})

socket.on('error', (msg) => {
   addLog(`ERROR FROM SERVER: ${msg}`);
   console.error(`ERROR FROM SERVER: ${msg}`);
})

socket.on('gameTime', (time) => {
   gameTime = time;

   if (time === 5)
      hurrySound[0].play();
   if (time === 3)
      hurrySound[Math.floor(Math.random() * (hurrySound.length - 1)) + 1].play();
   
   if (time % 20 === 16)
      tauntSound[Math.floor(Math.random() * tauntSound.length)].play();
})