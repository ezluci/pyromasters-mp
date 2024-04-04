'use strict';



let gameTime = 0;
var canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords = {}, keys, map = [], moveSpeed, switchedKeys, shields, lastPressed, CAN_MOVE = false, END_SCREEN = null, RANKING = null;


ASSETS_LOADING.then(() => {


   

socket.emit('playerJoined', usernameHTML, roomHTML, (players, colorsCoords, map1, roomStatus) => {
   map = map1
   
   players.forEach( ({username, color, isOwner}) => {
      addPlayerToList(username, color, isOwner)
   });

   Object.keys(colorsCoords).forEach((color) => {
      coords[color] = colorsCoords[color]
   })

   if (roomStatus === ROOM_STATUS.WAITING || roomStatus === ROOM_STATUS.STARTING || roomStatus === ROOM_STATUS.ENDED)
      sounds.menu.play();
})

canvas = document.querySelector('#canvas');
ctx = canvas.getContext('2d');









/// record key press events
keys = {a:0, s:0, d:0, w:0, p:0}
lastPressed = ''

document.onkeydown = (event) => {
   let code = event.code

   if (switchedKeys) {
      switch (code) {
         case 'KeyA':   code = 'KeyD'; break;
         case 'KeyS':   code = 'KeyW'; break;
         case 'KeyD':   code = 'KeyA'; break;
         case 'KeyW':   code = 'KeyS'; break;
      }
   }

   switch (code) {
      case 'KeyA':   keys.a = 1; lastPressed = 'a'; break;
      case 'KeyS':   keys.s = 1; lastPressed = 's'; break;
      case 'KeyD':   keys.d = 1; lastPressed = 'd'; break;
      case 'KeyW':   keys.w = 1; lastPressed = 'w'; break;
      case 'KeyP':   keys.p = 1; break;
   }
}

document.onkeyup = (event) => {
   let code = event.code

   if (switchedKeys) {
      switch (code) {
         case 'KeyA':   code = 'KeyD'; break;
         case 'KeyS':   code = 'KeyW'; break;
         case 'KeyD':   code = 'KeyA'; break;
         case 'KeyW':   code = 'KeyS'; break;
      }
   }

   switch (code) {
      case 'KeyA':   keys.a = 0; (lastPressed === 'a' ? lastPressed = '' :1); break;
      case 'KeyS':   keys.s = 0; (lastPressed === 's' ? lastPressed = '' :1); break;
      case 'KeyD':   keys.d = 0; (lastPressed === 'd' ? lastPressed = '' :1); break;
      case 'KeyW':   keys.w = 0; (lastPressed === 'w' ? lastPressed = '' :1); break;
      case 'KeyP':   keys.p = 0; break;
   }
}


myColor = 'spectator'
coords = {
   'white': INEXISTENT_POS,
   'black': INEXISTENT_POS,
   'orange': INEXISTENT_POS,
   'green': INEXISTENT_POS
}
let lastFrameTime


const intervalID2 = setInterval(() => {
   if (map[0]) {
      clearInterval(intervalID2);

      // starting game loop
      document.querySelector('#loading').hidden = true;
      lastFrameTime = performance.now();
      moveSpeed = MOVE_SPEEDS[0];
      switchedKeys = 0;
      shields = {
         white: {val: false, timeout: null},
         black: {val: false, timeout: null},
         orange:{val: false, timeout: null},
         green: {val: false, timeout: null}
      };
      window.requestAnimationFrame(gameloop);
   }
}, 40);



function DRAW_game() {

   ctx.fillStyle = '#203d37'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   ctx.fillStyle = 'rgba(131, 29, 29, 0.841)'
   ctx.fillRect(OFFSET_LEFT, OFFSET_UP, canvas.width - OFFSET_LEFT - OFFSET_RIGHT, canvas.height - OFFSET_UP - OFFSET_DOWN)


   // draw map blocks
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y)
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         switch (map[y][x]) {
            case BLOCK.NO:
               break;
            case BLOCK.NORMAL:
               drawBlock(images.block, x, y); break;
            case BLOCK.BOMB:
               drawBlock(images.bomb, x, y, 0);  break;
            case BLOCK.FIRE:
               drawBlock(images.fire, x, y, 0);  break;
            case BLOCK.PERMANENT:
               drawBlock(images.blockPermanent, x, y);  break;
            
            case BLOCK.POWER_BOMBPLUS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bombplus, x, y);   break;
            case BLOCK.POWER_BOMBLENGTH:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bomblength, x, y); break;
            case BLOCK.POWER_SPEED:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.speed, x, y);   break;
            case BLOCK.POWER_SHIELD:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.shield, x, y);  break;
            case BLOCK.POWER_KICKBOMBS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.kickbombs, x, y);  break;
            case BLOCK.POWER_BOMBTIME:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bombtime, x, y);   break;
            case BLOCK.POWER_SWITCHPLAYER:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.switchplayer, x, y);  break;
            case BLOCK.POWER_ILLNESS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.illness, x, y); break;
            case BLOCK.POWER_BONUS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bonus, x, y);   break;
         }
      }
   
   // draw players
   ['white', 'black', 'orange', 'green'].forEach(color => {
      drawAnimation(animations[color + '_' + sprites.players[color].state], coords[color].x, coords[color].y);
      if (shields[color].val)
         drawPlayer(images.shield, coords[color].x, coords[color].y);
   });

   // draw gametime
   const m = Math.floor(gameTime / 60).toString();
   const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
   ctx.fillStyle = 'black';
   ctx.font = '30px serif';
   ctx.fillText(`${m}:${s}`, 750, 23);
}



function gameloop() {
   // calculate deltaTime
   const currentTime = performance.now()
   deltaTime = currentTime - lastFrameTime
   lastFrameTime = currentTime



   /// UPDATES

   if (CAN_MOVE) { // variable changed in game-socket.js
      me = coords[myColor]
      meOld = {x: me.x, y: me.y}

      // place bomb
      if (keys.p) {
         socket.emit('tryPlaceBomb');
      }

      // move
      let keysPressed = 0
      if (keys.a) keysPressed ++
      if (keys.s) keysPressed ++
      if (keys.d) keysPressed ++
      if (keys.w) keysPressed ++

      const lastAnimState = sprites.players[myColor].state;

      if (keysPressed === 1) {
         if (keys.a)
            moveLeft()
         else if (keys.s)
            moveDown()
         else if (keys.d)
            moveRight()
         else if (keys.w)
            moveUp()
      }
      else if (keysPressed === 2) {
         if (lastPressed === 'a')
            moveLeft()
         else if (lastPressed === 's')
            moveDown()
         else if (lastPressed === 'd')
            moveRight()
         else if (lastPressed === 'w')
            moveUp()
      }
      else
         sprites.players[myColor].state = 'idle';
      

      me.x = Math.max(MIN_X, me.x)
      me.x = Math.min(MAX_X, me.x)
      me.y = Math.max(MIN_Y, me.y)
      me.y = Math.min(MAX_Y, me.y)

      if (meOld.x !== me.x || meOld.y !== me.y || lastAnimState !== sprites.players[myColor].state)
         socket.emit('coords', me, sprites.players[myColor].state)
   
      coords[myColor] = me;
   }



   /// DRAWING

   if (!END_SCREEN)
      DRAW_game();
   else {
      ctx.drawImage(images.endscreens[END_SCREEN], 0, 0, canvas.width, canvas.height);
      let k = 50;
      Object.entries(RANKING).forEach(entry => {
         const [player, wins] = entry;
         ctx.fillText(`${player}: ${wins} wins`, 50, k);
         k += 50;
      });
   }

   /// SOUND

   // some sounds are handled in  game-socket.js and in game.html.  WEIRD RIGHT???????
   // update - actually all of the sounds are handled there uups


   window.requestAnimationFrame(gameloop);
}


})