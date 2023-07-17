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

   if (username === usernameHTML) {
      myColor = color;
      if (color !== 'spectator')
         CAN_MOVE = true;
      else
         CAN_MOVE = false;
   }
})


socket.on('room_status', (msg) => {
   document.querySelector('#room-status').innerText = 'room status: ' + msg;
   if (msg === 'running') {
      if (myColor !== 'spectator')
         CAN_MOVE = true;
      sounds.menu.stop();
   }
   if (msg === 'ended')
      sounds.menu.play();
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
      me = INEXISTENT_POS;
      CAN_MOVE = false;
   }
   sounds.dead[Math.floor(Math.random() * sounds.dead.length)].play();
   coords[color] = INEXISTENT_POS;
})


socket.on('coords', (color, coords1) => {
   coords[color] = coords1;
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


socket.on('endscreen', (color) => {
   if (!color)
      addLog('Draw! Press \'Start game\' to play again.');
   else
      addLog(`${color.slice(0, 1).toUpperCase() + color.slice(1)} won! Press \'Start game\' to play again.`);
})


socket.on('error', (msg) => {
   addLog(`ERROR FROM SERVER: ${msg}`);
   console.error(`ERROR FROM SERVER: ${msg}`);
})