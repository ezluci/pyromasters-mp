let canvas, ctx, meOld, meNew, me, deltaTime, myColor, coords, keys

window.addEventListener('load', () => {

canvas = document.querySelector('#canvas')
ctx = canvas.getContext('2d')


let imagesLoaded = 0
let plrImg = {'white': undefined, 'black': undefined, 'orange': undefined, 'green': undefined}
let blockImg


loadImage('assets/white.jpg').then(image => {
   plrImg['white'] = image
   imagesLoaded ++
})

loadImage('assets/black.jpg').then(image => {
   plrImg['black'] = image
   imagesLoaded ++
})

loadImage('assets/orange.jpg').then(image => {
   plrImg['orange'] = image
   imagesLoaded ++
})

loadImage('assets/green.jpg').then(image => {
   plrImg['green'] = image
   imagesLoaded ++
})

loadImage('assets/block.jpg').then(image => {
   blockImg = image
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
   }
}

document.onkeyup = (event) => {
   switch (event.code) {
      case 'KeyA':   keys.a = 0; (lastPressed === 'a' ? lastPressed = '' :1); break;
      case 'KeyS':   keys.s = 0; (lastPressed === 's' ? lastPressed = '' :1); break;
      case 'KeyD':   keys.d = 0; (lastPressed === 'd' ? lastPressed = '' :1); break;
      case 'KeyW':   keys.w = 0; (lastPressed === 'w' ? lastPressed = '' :1); break;
   }
}


const fpsElem = document.querySelector('#fps')
myColor = 'spectator'
coords = {
   'white': {x: MIN_X, y: MIN_Y},
   'black': {x: MAX_X, y: MAX_Y},
   'orange': {x: MAX_X, y: MIN_Y},
   'green': {x: MIN_X, y: MAX_Y}
}
let lastFrameTime

const intervalID = setInterval(() => {
   if (imagesLoaded === 5) {
      clearInterval(intervalID)

      // starting game loop
      document.querySelector('#loading').hidden = true
      lastFrameTime = performance.now()
      window.requestAnimationFrame(gameloop)
   }
}, 25)



function gameloop() {
   // calculate deltaTime and FPS
   const currentTime = performance.now()
   deltaTime = currentTime - lastFrameTime
   lastFrameTime = currentTime
   const FPS = 1000 / deltaTime


   /// UPDATES

   if (myColor !== 'spectator') {
      me = coords[myColor]
      meOld = {x: me.x, y: me.y}


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

   ctx.fillStyle = '#0C0C06'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   ctx.fillStyle = 'rgba(131, 29, 29, 0.541)'
   ctx.fillRect(OFFSET_LEFT, OFFSET_UP, canvas.width - OFFSET_LEFT - OFFSET_RIGHT, canvas.height - OFFSET_UP - OFFSET_DOWN)


   for (let i = 0; i < 4; ++i) {
      if (indexToColor(i) === myColor)
         continue;
      drawPlayer(plrImg[indexToColor(i)], coords[indexToColor(i)].x, coords[indexToColor(i)].y)
   }
   if (myColor !== 'spectator')
      drawPlayer(plrImg[myColor], me.x, me.y)

   for (let yb = 1; yb < BLOCKS_VERTICALLY; yb += 2)
      for (let xb = 1; xb < BLOCKS_HORIZONTALLY; xb += 2)
         drawBlock(blockImg, xb, yb)
   
   ctx.fillStyle = 'gray'
   ctx.font = '30px serif'
   ctx.fillText(`FPS: ${Math.floor(FPS)}, deltaTime: ${deltaTime.toFixed(1)}`, 20, 23)
   
   window.requestAnimationFrame(gameloop)
}

})