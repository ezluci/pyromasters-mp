const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')
const OFFSET_LEFT = 10
const OFFSET_RIGHT = 10
const OFFSET_UP = 27
const OFFSET_DOWN = 10
const BLOCKS_HORIZONTALLY = 15
const BLOCKS_VERTICALLY = 11
const BLOCK_SIZE = 53

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

const intervalID = setInterval(() => {
   if (imagesLoaded === 3) {
      clearInterval(intervalID)
      later()
   }
}, 30)


// this function draws a block using block coordinates => x=0..15 and y=0.11
function drawBlock(block, xBlock, yBlock) {
   ctx.drawImage(block, OFFSET_LEFT + xBlock * BLOCK_SIZE, OFFSET_UP + yBlock * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
}

// this function draws a player using normal coordinates WITHOUT OFFSET
function drawPlayer(player, x, y) {
   ctx.drawImage(player, OFFSET_LEFT + x, OFFSET_UP + y)
}


// record key press events
const keys = []
keys['a'] = keys['s'] = keys['d'] = keys['w'] = 0

document.onkeydown = (event) => {
   switch (event.code) {
      case 'KeyA':   keys['a'] = 1; break;
      case 'KeyS':   keys['s'] = 1; break;
      case 'KeyD':   keys['d'] = 1; break;
      case 'KeyW':   keys['w'] = 1; break;
   }
}

document.onkeyup = (event) => {
   switch (event.code) {
      case 'KeyA':   keys['a'] = 0; break;
      case 'KeyS':   keys['s'] = 0; break;
      case 'KeyD':   keys['d'] = 0; break;
      case 'KeyW':   keys['w'] = 0; break;
   }
}


function later() {
   document.querySelector('#loading').hidden = true
   
   ctx.fillStyle = '#0C0C06'
   ctx.fillRect(0, 0, canvas.width, canvas.clientHeight)

   ctx.fillStyle = 'rgba(131, 29, 29, 0.541)'
   ctx.fillRect(OFFSET_LEFT, OFFSET_UP, canvas.width - OFFSET_LEFT - OFFSET_RIGHT, canvas.height - OFFSET_UP - OFFSET_DOWN)

   drawBlock(whitePlrImg, 0, 0)
   drawBlock(blackPlrImg, BLOCKS_HORIZONTALLY - 1, BLOCKS_VERTICALLY - 1)

   for (let yb = 1; yb < BLOCKS_VERTICALLY; yb += 2)
      for (let xb = 1; xb < BLOCKS_HORIZONTALLY; xb += 2)
         drawBlock(blockImg, xb, yb)
}