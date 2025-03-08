'use strict';



let gameTime = 0, playersAlive = [];
var canvas, ctx, meOld, me, deltaTime, myColor, coords = {}, keys_p = 0, map, moveSpeed, switchedKeys, shields, keyPressQueue = [], CAN_MOVE = false, END_SCREEN = null, RANKING = null, MAP_NAME = null, bombs = [], bombfires = [];

map = [];
for (let i = 0; i < BLOCKS_VERTICALLY; i += 1) {
   map[i] = [];
   for (let j = 0; j < BLOCKS_HORIZONTALLY; j += 1) {
      map[i][j] = BLOCK.NO;
   }
}


ASSETS_LOADING.then(() => {

socket = io(`${protocol}://${window.location.hostname}:22822?userName=${usernameHTML}&roomName=${roomHTML}`);
document.dispatchEvent(new CustomEvent('socket-loaded'));

canvas = document.querySelector('#canvas');
ctx = canvas.getContext('2d');




myColor = 'spectator'
coords = {
   'white': {},
   'black': {},
   'orange': {},
   'green': {}
}
let lastFrameTime


// starting game loop

const stopController = new AbortController();
document.addEventListener(
   'mapnamechange',
   () => {
      console.warn('map change');
      document.querySelector('#loading').hidden = true;
      if (MAP_NAME) {
         stopController.abort();
         window.requestAnimationFrame(gameloop);
      }
   },
   { signal: stopController.signal }
);

lastFrameTime = performance.now();
moveSpeed = MOVE_SPEEDS[0];
switchedKeys = 0;
shields = {
   white: false,
   black: false,
   orange: false,
   green: false
};



function DRAW_game() {

   ctx.fillStyle = '#203d37'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   // draw background
   ctx.drawImage(images.maps[MAP_NAME].background, OFFSET_LEFT, OFFSET_UP, canvas.width - OFFSET_LEFT - OFFSET_RIGHT, canvas.height - OFFSET_UP - OFFSET_DOWN);
   


   // draw map blocks
   if (map) {
      for (let y = 0; y < BLOCKS_VERTICALLY; ++y)
         for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
            if (MAP_NAME === 'fourway' && MAP_FOURWAY_PORTAL_POSITIONS.filter(({x: xx, y: yy}) => xx === x && yy === y).length === 1) {
               drawBlock(images.maps[MAP_NAME].portal, x, y);
            }
            
            switch (map[y][x]) {
               case BLOCK.NO:
                  break;
               case BLOCK.NORMAL:
                  drawBlock(images.maps[MAP_NAME].block, x, y); break;
               case BLOCK.PERMANENT:
                  drawBlock(images.maps[MAP_NAME].blockPermanent, x, y);  break;
               
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
               case BLOCK.POWER_SICK:
                  drawBlock(images.powers.main, x, y);
                  drawBlock(images.powers.sick, x, y); break;
               case BLOCK.POWER_BONUS:
                  drawBlock(images.powers.main, x, y);
                  drawBlock(images.powers.bonus, x, y);   break;
            }
         }
         
         bombs.forEach(({x, y, bombId}) => {drawBlock(images.bomb, x, y, 0)});
         bombfires.forEach(({x, y}) => drawBlock(images.fire, x, y, 0));
   }
   
   // draw players
   ['white', 'black', 'orange', 'green'].forEach(color => {
      if (!coords[color].alive) {
         return;
      }
      drawAnimation(animations[color + '_' + sprites.players[color].state], coords[color].x, coords[color].y);
      if (shields[color])
         drawPlayer(images.shield, coords[color].x, coords[color].y);
   });

   // draw gametime
   const m = Math.floor(gameTime / 60).toString();
   const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
   ctx.fillStyle = 'black';
   ctx.font = '30px serif';
   ctx.fillText(`${m}:${s}`, 750, 23);
}



let lastBombTime = -10000;

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
      if (keys_p && currentTime - lastBombTime > 100) {
         socket.emit('tryPlaceBomb');
         lastBombTime = currentTime;
      }

      // move

      if (keyPressQueue.length === 1 || keyPressQueue.length === 2) {
         const key = keyPressQueue[keyPressQueue.length - 1];
         if (key === 'a')
            moveLeft()
         else if (key === 's')
            moveDown()
         else if (key === 'd')
            moveRight()
         else if (key === 'w')
            moveUp()
      }

      me.x = Math.max(MIN_X, me.x)
      me.x = Math.min(MAX_X, me.x)
      me.y = Math.max(MIN_Y, me.y)
      me.y = Math.min(MAX_Y, me.y)

      // check if the player went through any fourway portals
      if (MAP_NAME === 'fourway' && (me.x === meOld.x || me.y === meOld.y) && (me.x !== meOld.x || me.y !== meOld.y)) {
         let A, B, dif;
         if (me.x !== meOld.x) {
            A = me.x;
            B = meOld.x;
            dif = 1;
         } else {
            A = me.y;
            B = meOld.y;
            dif = 2;
         }
         if (A > B) {
            [A, B] = [B, A];
         }

         let portalIdx = null;
         MAP_FOURWAY_PORTAL_POSITIONS.forEach(({x, y}, idx) => {
            x *= BLOCK_SIZE;
            y *= BLOCK_SIZE;
            if ((me.x === x && me.y === y) ||
                  (dif === 1 && me.y === y && A < x && x < B) ||
                  (dif === 2 && me.x === x && A < y && y < B)) {
               portalIdx = idx;
            }
         });

         if (portalIdx !== null) {
            socket.emit('portaltp');
            me.x = MAP_FOURWAY_NEXT_PORTAL[portalIdx].x * BLOCK_SIZE;
            me.y = MAP_FOURWAY_NEXT_PORTAL[portalIdx].y * BLOCK_SIZE;
         }
      }

      // changing animations

      if (meOld.x === me.x && meOld.y === me.y) {
         // walk -> idle
         const key = keyPressQueue.length ? keyPressQueue[keyPressQueue.length - 1] : '';
         if (key) {
            changeAnimation(myColor, 'idle_' + (key === 'a' ? 'left' : key === 'd' ? 'right' : key === 'w' ? 'back' : 'front'));
         } else {
            changeAnimation(myColor, 'idle_' + sprites.players[myColor].state.split('_')[1]);
         }
      } else if (keyPressQueue.length === 1 || keyPressQueue.length === 2) {
         let q;
         const key = keyPressQueue.length && keyPressQueue[keyPressQueue.length - 1] || ' ';
         if (key === 'w') {
            if (meOld.y === me.y) {
               if (me.x < meOld.x) {
                  q = 'left';
               } else {
                  q = 'right';
               }
            } else {
               q = 'up';
            }
         } else if (key === 's') {
            if (meOld.y === me.y) {
               if (me.x < meOld.x) {
                  q = 'left';
               } else {
                  q = 'right';
               }
            } else {
               q = 'down';
            }
         } else if (key === 'a') {
            if (meOld.x === me.x) {
               if (me.y < meOld.y) {
                  q = 'up';
               } else {
                  q = 'down';
               }
            } else {
               q = 'left';
            }
         } else if (key === 'd') {
            if (meOld.x === me.x) {
               if (me.y < meOld.y) {
                  q = 'up';
               } else {
                  q = 'down';
               }
            } else {
               q = 'right';
            }
         }

         if (q === 'up') {
            q = 'back';
         } else if (q === 'down') {
            q = 'front';
         }
         changeAnimation(myColor, 'walk_' + q);
      }
      
      socket.emit('coords', me.x, me.y, sprites.players[myColor].state)
   
      coords[myColor] = me;
   }



   /// DRAWING
   if (!END_SCREEN)
      DRAW_game();
   else {
      if (bombs.length) bombs = [];
      if (bombfires.length)   bombfires = [];
      ctx.drawImage(images.endscreens[END_SCREEN], 0, 0, canvas.width, canvas.height);
      let k = 50;
      RANKING.forEach(({name, wins, kills}) => {
         ctx.fillText(`${name}: ${wins} wins      ${kills} kills`, 50, k);
         k += 50;
      });
   }

   window.requestAnimationFrame(gameloop);
}


})