'use strict';

let LOADED_COUNT = 0, gameTime = 0;
let canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords, keys, map = [], moveSpeed, switchedKeys, shields, lastPressed, CAN_MOVE = false, END_SCREEN = null;

let plrImg = {'white': undefined, 'black': undefined, 'orange': undefined, 'green': undefined};
let shieldImg;
let blockFixedImg, blockImg, bombImg, fireImg;
const backgrounds = [];
const endscreens = {};
const powersImg = {};

const sounds = {};


window.addEventListener('load', () => {

canvas = document.querySelector('#canvas');
ctx = canvas.getContext('2d');



// loading sounds

const vol = slider.value / 100; // the slider from game.html

sounds.menu = new Howl({
   src: ['assets/sounds/menu.mp3'],
   loop: true,
   volume: vol
});

sounds.hurry = [];
sounds.hurry.push(new Howl({
   src: ['assets/sounds/hurry.mp3'],
   volume: vol
}));

for (let i = 1; i <= 5; ++i) {
   sounds.hurry.push(new Howl({
      src: [`assets/sounds/hurry${i}.mp3`],
      volume: vol
   }));
}

sounds.taunt = [];
for (let i = 1; i <= 13; ++i) {
   sounds.taunt.push(new Howl({
      src: [`assets/sounds/taunt${i}.mp3`],
      volume: vol
   }));
}

sounds.dropBomb = new Howl({
   src: ['assets/sounds/dropbomb.mp3'],
   volume: vol
});

sounds.dropBombSick = new Howl({
   src: ['assets/sounds/dropbombsick.mp3'],
   volume: vol
});

sounds.explodeBomb = [];
for (let i = 1; i <= 4; ++i)
   sounds.explodeBomb.push(new Howl({
      src: [`assets/sounds/explode${i}.mp3`],
      volume: vol
   }));

sounds.powerup = new Howl({
   src: ['assets/sounds/powerup.mp3'],
   volume: vol
});

sounds.bonusAll = new Howl({
   src: ['assets/sounds/bonusall.mp3'],
   volume: vol
});

sounds.bonusLost = new Howl({
   src: ['assets/sounds/bonuslost.mp3'],
   volume: vol
});

sounds.dead = [];
for (let i = 1; i <= 5; ++i) {
   sounds.dead.push(new Howl({
      src: [`assets/sounds/dead${i}.mp3`],
      volume: vol
   }));
}

sounds.draw = [];
for (let i = 1; i <= 5; ++i) {
   sounds.draw.push(new Howl({
      src: [`assets/sounds/draw${i}.mp3`],
      volume: vol,
      onend: () => { sounds.menu.play() }
   }));
}

sounds.win = [];
for (let i = 1; i <= 5; ++i) {
   sounds.win.push(new Howl({
      src: [`assets/sounds/win${i}.mp3`],
      volume: vol,
      onend: () => { sounds.menu.play() }
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

// backgrounds
loadImage('assets/images/backgrounds/bricktown.jpg').then(image => {
   backgrounds.push(image);
   LOADED_COUNT ++;
});

// endscreens
loadImage('assets/images/endscreens/draw.jpg').then(image => {
   endscreens.draw = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/white.jpg').then(image => {
   endscreens.white = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/black.jpg').then(image => {
   endscreens.black = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/orange.jpg').then(image => {
   endscreens.orange = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/green.jpg').then(image => {
   endscreens.green = image;
   LOADED_COUNT ++;
});



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
   if (LOADED_COUNT === 24) {
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

   // draw gametime
   const m = Math.floor(gameTime / 60).toString();
   const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
   ctx.fillStyle = 'gray';
   ctx.font = '30px serif';
   ctx.fillText(`${m}:${s}`, 750, 23);
}



function gameloop() {
   // calculate deltaTime and FPS
   const currentTime = performance.now()
   deltaTime = currentTime - lastFrameTime
   // !!! maybe limit deltatime to 50..?
   lastFrameTime = currentTime
   const FPS = 1000 / deltaTime



   /// UPDATES

   if (CAN_MOVE) {
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

   if (!END_SCREEN)
      DRAW_game();
   else {
      ctx.drawImage(endscreens[END_SCREEN], 0, 0, canvas.width, canvas.height);
   }

   
   // draw fps
   ctx.fillStyle = 'gray';
   ctx.font = '30px serif';
   ctx.fillText(`FPS: ${Math.floor(FPS)}, deltaTime: ${deltaTime.toFixed(1)}`, 20, 23);



   /// SOUND

   // some sounds are handled in  game-socket.js and in game.html.  WEIRD RIGHT???????
   // update - actually all of the sounds are handled there uups


   window.requestAnimationFrame(gameloop);
}

})