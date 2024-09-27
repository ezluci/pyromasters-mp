'use strict';



let gameTime = 0;
var canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords = {}, keys, map, moveSpeed, switchedKeys, shields, lastPressed, CAN_MOVE = false, END_SCREEN = null, RANKING = null, MAP_NAME = null, bombs = [], bombfires = [];


ASSETS_LOADING.then(() => {

map = [];
for (let i = 0; i < BLOCKS_VERTICALLY; i += 1) {
   map[i] = [];
   for (let j = 0; j < BLOCKS_HORIZONTALLY; j += 1) {
      map[i][j] = BLOCK.NO;
   }
}

socket.emit('playerJoined', usernameHTML, roomHTML, (players, mapName, map1, roomStatus) => {
   if (map1)   map = map1
   MAP_NAME = mapName;
   document.dispatchEvent( new CustomEvent('mapnamechange') );
   
   players.forEach( ({username, color, isOwner}) => {
      addPlayerToList(username, color, isOwner)
   });

   if (roomStatus === ROOM_STATUS.WAITING || roomStatus === ROOM_STATUS.STARTING)
      sounds.menu.play();
})

canvas = document.querySelector('#canvas');
ctx = canvas.getContext('2d');




keys = {a:0, s:0, d:0, w:0, p:0}
myColor = 'spectator'
coords = {
   'white': { ...INEXISTENT_POS },
   'black': { ...INEXISTENT_POS },
   'orange': { ...INEXISTENT_POS },
   'green': { ...INEXISTENT_POS }
}
let lastFrameTime


// starting game loop
const stopController = new AbortController();
document.addEventListener(
   'mapnamechange',
   () => {
      if (MAP_NAME) {
         stopController.abort();
         window.requestAnimationFrame(gameloop);
      }
   },
   { signal: stopController.signal }
);

document.querySelector('#loading').hidden = true;
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
      else {
         changeAnimation(myColor, 'idle');
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
            me.x = MAP_FOURWAY_NEXT_PORTAL[portalIdx].x * BLOCK_SIZE;
            me.y = MAP_FOURWAY_NEXT_PORTAL[portalIdx].y * BLOCK_SIZE;
         }
      }

      if (meOld.x !== me.x || meOld.y !== me.y || lastAnimState !== sprites.players[myColor].state)
         socket.emit('coords', me, sprites.players[myColor].state)
   
      coords[myColor] = me;
   }



   /// DRAWING
   if (!END_SCREEN)
      DRAW_game();
   else {
      bombs = [];
      bombfires = [];
      ctx.drawImage(images.endscreens[END_SCREEN], 0, 0, canvas.width, canvas.height);
      let k = 50;
      RANKING.forEach(({username, wins, kills}) => {
         ctx.fillText(`${username}: ${wins} wins      ${kills} kills`, 50, k);
         k += 50;
      });
   }


   /// SOUND

   // some sounds are handled in  game-socket.js and in game.html.  WEIRD RIGHT???????
   // update - actually all of the sounds are handled there uups


   window.requestAnimationFrame(gameloop);
}


})