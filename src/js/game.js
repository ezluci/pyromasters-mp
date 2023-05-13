const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const OFFSET_LEFT = 10
const OFFSET_RIGHT = 10
const OFFSET_UP = 27
const OFFSET_DOWN = 10

const BLOCKS_HORIZONTALLY = 15
const BLOCKS_VERTICALLY = 11
const BLOCK_SIZE = 53
const MOVE_SPEED = 0.3 // default 0.15 maybe?
const BLOCK_SAFE_PX = 5

const MIN_X = 0
const MIN_Y = 0
const MAX_X = BLOCK_SIZE * (BLOCKS_HORIZONTALLY - 1)
const MAX_Y = BLOCK_SIZE * (BLOCKS_VERTICALLY - 1)


let imagesLoaded = 0
let whitePlrImg, blackPlrImg
let blockImg

const loadImage = src =>
   new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
   })


loadImage('assets/white.jpg').then(image => {
   whitePlrImg = image
   imagesLoaded ++
})

loadImage('assets/black.jpg').then(image => {
   blackPlrImg = image
   imagesLoaded ++
})

loadImage('assets/block.jpg').then(image => {
   blockImg = image
   imagesLoaded ++
})


/// some useful functions
// this function draws a block using block coordinates => xB=0..15 and yB=0.11
function drawBlock(block, xBlock, yBlock) {
   ctx.drawImage(block, OFFSET_LEFT + xBlock * BLOCK_SIZE, OFFSET_UP + yBlock * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
function drawPlayer(player, x, y) {
   ctx.drawImage(player, OFFSET_LEFT + x, OFFSET_UP + y, BLOCK_SIZE, BLOCK_SIZE)
}


/// record key press events
const keys = {}
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
const me = {x: 0, y: 0}
let lastFrameTime

const intervalID = setInterval(() => {
   if (imagesLoaded === 3) {
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
   const deltaTime = currentTime - lastFrameTime
   lastFrameTime = currentTime
   const FPS = 1000 / deltaTime


   /// UPDATES

   const meNew = {x: me.x, y: me.y}

   function moveLeft() {
      if (me.x === MIN_X)
         return
      
      const mod = me.y % (2 * BLOCK_SIZE)

      if (mod === 0)
         meNew.x -= MOVE_SPEED * deltaTime
      else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
         return // next to the player is a block. we don't move anything.
      else {
         if (mod < BLOCK_SIZE) {
            meNew.y -= MOVE_SPEED * deltaTime
            const newMod = meNew.y % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               meNew.x -= 2 * BLOCK_SIZE - newMod
               meNew.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
         else {
            meNew.y += MOVE_SPEED * deltaTime
            const newMod = meNew.y % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               meNew.x += newMod
               meNew.y = Math.floor(meNew.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
   }

   function moveDown() {
      if (me.y === MAX_Y)
         return
      
      const mod = me.x % (2 * BLOCK_SIZE)

      if (mod === 0)
         meNew.y += MOVE_SPEED * deltaTime
      else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
         return
      else {
         if (mod < BLOCK_SIZE) {
            meNew.x -= MOVE_SPEED * deltaTime
            const newMod = meNew.x % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               meNew.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
               meNew.y += 2 * BLOCK_SIZE - newMod
            }
         }
         else {
            meNew.x += MOVE_SPEED * deltaTime
            const newMod = meNew.x % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               meNew.x = Math.floor(meNew.x / BLOCK_SIZE) * BLOCK_SIZE
               meNew.y += newMod
            }
         }
      }
   }

   function moveRight() {
      if (me.x === MAX_X)
         return
      
      const mod = me.y % (2 * BLOCK_SIZE)

      if (mod === 0)
         meNew.x += MOVE_SPEED * deltaTime
      else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
         return
      else {
         if (mod < BLOCK_SIZE) {
            meNew.y -= MOVE_SPEED * deltaTime
            const newMod = meNew.y % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               meNew.x += 2 * BLOCK_SIZE - newMod
               meNew.y = Math.floor(me.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
         else {
            meNew.y += MOVE_SPEED * deltaTime
            const newMod = meNew.y % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               meNew.x += newMod
               meNew.y = Math.floor(meNew.y / BLOCK_SIZE) * BLOCK_SIZE
            }
         }
      }
   }

   function moveUp() {
      if (me.y === MIN_Y)
         return
      
      const mod = me.x % (2 * BLOCK_SIZE)

      if (mod === 0)
         meNew.y -= MOVE_SPEED * deltaTime
      else if (BLOCK_SIZE - BLOCK_SAFE_PX <= mod && mod <= BLOCK_SIZE + BLOCK_SAFE_PX)
         return
      else {
         if (mod < BLOCK_SIZE) {
            meNew.x -= MOVE_SPEED * deltaTime
            const newMod = meNew.x % (2 * BLOCK_SIZE)
            if (newMod > mod) {
               meNew.x = Math.floor(me.x / BLOCK_SIZE) * BLOCK_SIZE
               meNew.y -= 2 * BLOCK_SIZE - newMod
            }
         }
         else {
            meNew.x += MOVE_SPEED * deltaTime
            const newMod = meNew.x % (2 * BLOCK_SIZE)
            if (newMod < mod) {
               meNew.x = Math.floor(meNew.x / BLOCK_SIZE) * BLOCK_SIZE
               meNew.y -= newMod
            }
         }
      }
   }

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
   

   meNew.x = Math.max(MIN_X, meNew.x)
   meNew.x = Math.min(MAX_X, meNew.x)
   meNew.y = Math.max(MIN_Y, meNew.y)
   meNew.y = Math.min(MAX_Y, meNew.y)

   me.x = meNew.x
   me.y = meNew.y

   /// DRAWING

   ctx.fillStyle = '#0C0C06'
   ctx.fillRect(0, 0, canvas.width, canvas.height)

   ctx.fillStyle = 'rgba(131, 29, 29, 0.541)'
   ctx.fillRect(OFFSET_LEFT, OFFSET_UP, canvas.width - OFFSET_LEFT - OFFSET_RIGHT, canvas.height - OFFSET_UP - OFFSET_DOWN)

   drawPlayer(whitePlrImg, me.x, me.y)
   drawPlayer(blackPlrImg, (BLOCKS_HORIZONTALLY - 1) * BLOCK_SIZE, (BLOCKS_VERTICALLY - 1) * BLOCK_SIZE)

   for (let yb = 1; yb < BLOCKS_VERTICALLY; yb += 2)
      for (let xb = 1; xb < BLOCKS_HORIZONTALLY; xb += 2)
         drawBlock(blockImg, xb, yb)
   
   ctx.fillStyle = 'gray'
   ctx.font = '30px serif'
   ctx.fillText(`FPS: ${Math.floor(FPS)}, deltaTime: ${deltaTime}`, 20, 23)
   
   window.requestAnimationFrame(gameloop)
}