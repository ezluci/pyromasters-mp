'use strict';

let canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords, keys, map = [], moveSpeed, switchedKeys, shields, lastPressed;
let menuSound, hurrySound = [], tauntSound = [];
let gameTime = 0;


window.addEventListener('load', () => {

canvas = document.querySelector('#canvas');
ctx = canvas.getContext('2d');


let LOADED_COUNT = 0;
let plrImg = {'white': undefined, 'black': undefined, 'orange': undefined, 'green': undefined};
let shieldImg;
let blockFixedImg, blockImg, bombImg, fireImg;
const powersImg = {};

// loading sounds

menuSound = new Howl({
   src: ['assets/sounds/menu.mp3'],
   loop: true,
   volume: 0.25,
   autoplay: true,
});

hurrySound.push(new Howl({
   src: ['assets/sounds/hurry.mp3'],
   volume: .5
}));

for (let i = 1; i <= 5; ++i) {
   hurrySound.push(new Howl({
      src: [`assets/sounds/hurry${i}.mp3`],
      volume: .5
   }));
}

for (let i = 1; i <= 13; ++i) {
   tauntSound.push(new Howl({
      src: [`assets/sounds/taunt${i}.mp3`],
      volume: .5
   }));
}

// loading images

loadImage('assets/images/players/white.png').then(image => {
   plrImg['white'] = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/players/black.png').then(image => {
   plrImg['black'] = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/players/orange.png').then(image => {
   plrImg['orange'] = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/players/green.png').then(image => {
   plrImg['green'] = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/players/shield.png').then(image => {
   shieldImg = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/fixed.png').then(image => {
   blockFixedImg = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/normal.png').then(image => {
   blockImg = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/bomb.png').then(image => {
   bombImg = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/fire.png').then(image => {
   fireImg = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bombplus.png').then(image => {
   powersImg.bombplus = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bomblength.png').then(image => {
   powersImg.bomblength = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_speed.png').then(image => {
   powersImg.speed = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_shield.png').then(image => {
   powersImg.shield = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_kickbombs.png').then(image => {
   powersImg.kickbombs = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bombtime.png').then(image => {
   powersImg.bombtime = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_switchplayer.png').then(image => {
   powersImg.switchplayer = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_illness.png').then(image => {
   powersImg.illness = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bonus.png').then(image => {
   powersImg.bonus = image;
   LOADED_COUNT ++;
})



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


const fpsElem = document.querySelector('#fps') // currently not working
myColor = 'spectator'
coords = {
   'white': INEXISTENT_POS,
   'black': INEXISTENT_POS,
   'orange': INEXISTENT_POS,
   'green': INEXISTENT_POS
}
let lastFrameTime

const intervalID = setInterval(() => {
   if (LOADED_COUNT === 18) {
      clearInterval(intervalID);

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
   }
}, 40);


function gameloop() {
   // calculate deltaTime and FPS
   const currentTime = performance.now()
   deltaTime = currentTime - lastFrameTime
   // !!! maybe limit deltatime to 50..?
   lastFrameTime = currentTime
   const FPS = 1000 / deltaTime



   /// UPDATES

   if (myColor !== 'spectator') {
      me = coords[myColor]
      meOld = {x: me.x, y: me.y}

      // place bomb
      if (keys.p) {
            // !!! ADD BETTER BOMB PLACEMENT.
         const xx = Math.round(me.x / BLOCK_SIZE)
         const yy = Math.round(me.y / BLOCK_SIZE)
         socket.emit('tryPlaceBomb', xx, yy)
      }

      // move
      let keysPressed = 0
      if (keys.a) keysPressed ++
      if (keys.s) keysPressed ++
      if (keys.d) keysPressed ++
      if (keys.w) keysPressed ++

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
      

      me.x = Math.max(MIN_X, me.x)
      me.x = Math.min(MAX_X, me.x)
      me.y = Math.max(MIN_Y, me.y)
      me.y = Math.min(MAX_Y, me.y)

      if (meOld.x !== me.x || meOld.y !== me.y)
         socket.emit('coords', me)
   }



   /// DRAWING

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
               drawBlock(blockImg, x, y); break;
            case BLOCK.BOMB:
               drawBlock(bombImg, x, y);  break;
            case BLOCK.FIRE:
               drawBlock(fireImg, x, y);  break;
            case BLOCK.FIXED:
               drawBlock(blockFixedImg, x, y);  break;
            
            case BLOCK.POWER_BOMBPLUS:
               drawBlock(powersImg.bombplus, x, y);   break;
            case BLOCK.POWER_BOMBLENGTH:
               drawBlock(powersImg.bomblength, x, y); break;
            case BLOCK.POWER_SPEED:
               drawBlock(powersImg.speed, x, y);   break;
            case BLOCK.POWER_SHIELD:
               drawBlock(powersImg.shield, x, y);  break;
            case BLOCK.POWER_KICKBOMBS:
               drawBlock(powersImg.kickbombs, x, y);  break;
            case BLOCK.POWER_BOMBTIME:
               drawBlock(powersImg.bombtime, x, y);   break;
            case BLOCK.POWER_SWITCHPLAYER:
               drawBlock(powersImg.switchplayer, x, y);  break;
            case BLOCK.POWER_ILLNESS:
               drawBlock(powersImg.illness, x, y); break;
            case BLOCK.POWER_BONUS:
               drawBlock(powersImg.bonus, x, y);   break;
         }
      }
   
   // draw players
   ['white', 'black', 'orange', 'green'].forEach(color => {
      if (color === myColor)
         return;
      drawPlayer(plrImg[color], coords[color].x, coords[color].y);
      if (shields[color].val)
         drawPlayer(shieldImg, coords[color].x, coords[color].y);
   });

   if (myColor !== 'spectator') {
      drawPlayer(plrImg[myColor], me.x, me.y);
      if (shields[myColor].val)
         drawPlayer(shieldImg, me.x, me.y);
   }
   
   // draw fps
   ctx.fillStyle = 'gray';
   ctx.font = '30px serif';
   ctx.fillText(`FPS: ${Math.floor(FPS)}, deltaTime: ${deltaTime.toFixed(1)}`, 20, 23);

   // draw gametime
   const m = Math.floor(gameTime / 60).toString();
   const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
   ctx.fillText(`${m}:${s}`, 750, 23);



   /// SOUND

   // some sounds are handled in  game-socket.js -> gameTime.  WEIRD RIGHT???????


   window.requestAnimationFrame(gameloop);
}

})