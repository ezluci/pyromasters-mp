let canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords, keys, map = []

window.addEventListener('load', () => {

canvas = document.querySelector('#canvas')
ctx = canvas.getContext('2d')


let imagesLoaded = 0
let plrImg = {'white': undefined, 'black': undefined, 'orange': undefined, 'green': undefined}
let blockFixedImg, blockImg, bombImg, fireImg
const powersImg = {}

loadImage('assets/players/white.png').then(image => {
   plrImg['white'] = image
   imagesLoaded ++
})
loadImage('assets/players/black.png').then(image => {
   plrImg['black'] = image
   imagesLoaded ++
})
loadImage('assets/players/orange.png').then(image => {
   plrImg['orange'] = image
   imagesLoaded ++
})
loadImage('assets/players/green.png').then(image => {
   plrImg['green'] = image
   imagesLoaded ++
})
loadImage('assets/blocks/fixed.jpg').then(image => {
   blockFixedImg = image
   imagesLoaded ++
})
loadImage('assets/blocks/normal.jpg').then(image => {
   blockImg = image
   imagesLoaded ++
})
loadImage('assets/blocks/bomb.png').then(image => {
   bombImg = image
   imagesLoaded ++
})
loadImage('assets/blocks/fire.png').then(image => {
   fireImg = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_bombplus.png').then(image => {
   powersImg.bombplus = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_bomblength.png').then(image => {
   powersImg.bomblength = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_speed.png').then(image => {
   powersImg.speed = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_shield.png').then(image => {
   powersImg.shield = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_kickbombs.png').then(image => {
   powersImg.kickbombs = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_bombtime.png').then(image => {
   powersImg.bombtime = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_switchplayer.png').then(image => {
   powersImg.switchplayer = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_illness.png').then(image => {
   powersImg.illness = image
   imagesLoaded ++
})
loadImage('assets/blocks/power_bonus.png').then(image => {
   powersImg.bonus = image
   imagesLoaded ++
})



/// record key press events
keys = {}
let lastPressed = ''
keys.a = keys.s = keys.d = keys.w = 0

document.onkeydown = (event) => {
   switch (event.code) {
      case 'KeyA':   keys.a = 1; lastPressed = 'a'; break;
      case 'KeyS':   keys.s = 1; lastPressed = 's'; break;
      case 'KeyD':   keys.d = 1; lastPressed = 'd'; break;
      case 'KeyW':   keys.w = 1; lastPressed = 'w'; break;
      case 'KeyP':   keys.p = 1; break;
   }
}

document.onkeyup = (event) => {
   switch (event.code) {
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
   'white': DEFAULT_POS['white'],
   'black': DEFAULT_POS['black'],
   'orange': DEFAULT_POS['orange'],
   'green': DEFAULT_POS['green']
}
let lastFrameTime

const intervalID = setInterval(() => {
   if (imagesLoaded === 17) {
      clearInterval(intervalID)

      const intervalID2 = setInterval(() => {
         if (map[0]) {
            clearInterval(intervalID2)

            // starting game loop
            document.querySelector('#loading').hidden = true
            lastFrameTime = performance.now()
            window.requestAnimationFrame(gameloop)
         }
      }, 40)
   }
}, 40)


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
         socket.emit('try_placeBomb', xx, yy)
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
         if (map[y][x] === BLOCK.NO)
            ;
         else if (map[y][x] === BLOCK.NORMAL)
            drawBlock(blockImg, x, y)
         else if (map[y][x] === BLOCK.BOMB)
            drawBlock(bombImg, x, y)
         else if (map[y][x] === BLOCK.FIRE)
            drawBlock(fireImg, x, y)
         else if (map[y][x] === BLOCK.FIXED)
            drawBlock(blockFixedImg, x, y)
         
         else if (map[y][x] === BLOCK.POWER_BOMBPLUS)
            drawBlock(powersImg.bombplus, x, y)
         else if (map[y][x] === BLOCK.POWER_BOMBLENGTH)
            drawBlock(powersImg.bomblength, x, y)
         else if (map[y][x] === BLOCK.POWER_SPEED)
            drawBlock(powersImg.speed, x, y)
         else if (map[y][x] === BLOCK.POWER_SHIELD)
            drawBlock(powersImg.shield, x, y)
         else if (map[y][x] === BLOCK.POWER_KICKBOMBS)
            drawBlock(powersImg.kickbombs, x, y)
         else if (map[y][x] === BLOCK.POWER_BOMBTIME)
            drawBlock(powersImg.bombtime, x, y)
         else if (map[y][x] === BLOCK.POWER_SWITCHPLAYER)
            drawBlock(powersImg.switchplayer, x, y)
         else if (map[y][x] === BLOCK.POWER_ILLNESS)
            drawBlock(powersImg.illness, x, y)
         else if (map[y][x] === BLOCK.POWER_BONUS)
            drawBlock(powersImg.bonus, x, y)
      }
   
   // draw players
   for (let i = 0; i < 4; ++i) {
      if (indexToColor(i) === myColor)
         continue;
      drawPlayer(plrImg[indexToColor(i)], coords[indexToColor(i)].x, coords[indexToColor(i)].y)
   }
   if (myColor !== 'spectator')
      drawPlayer(plrImg[myColor], me.x, me.y)
   
   ctx.fillStyle = 'gray'
   ctx.font = '30px serif'
   ctx.fillText(`FPS: ${Math.floor(FPS)}, deltaTime: ${deltaTime.toFixed(1)}`, 20, 23)
   
   window.requestAnimationFrame(gameloop)
}

})