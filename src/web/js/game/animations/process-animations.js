'use strict';


const animations = {};


function nextAnimation(animation) {
   animation.counter ++;
   if (animation.counter === animation.data.length) {
      animation.counter = 0;
   }
}

function resetAnimation(animation) {
   animation.counter = 0;
}

function drawAnimation(animation, x, y) {
   const spriteData = animation.data[animation.counter];
   const trimmedRect = spriteData.trimmedRect;
   const rect = spriteData.rect;

   const sx = trimmedRect.x;
   const sy = trimmedRect.y;
   const sw = trimmedRect.w;
   const sh = trimmedRect.h;
   const dx = OFFSET_LEFT + x + (trimmedRect.x - rect.x);
   const dy = OFFSET_UP + y + (trimmedRect.y - rect.y) - 25;
   const dw = sw; // if the animations didn't match this exact resolution, this wouldn't work. you need percentages.
   const dh = sh;
   ctx.drawImage(sprites.players.green.img, sx, sy, sw, sh, dx, dy, dw, dh);
   // honestly i have no idea why putting green works ^ but i dont really care so im gonna let it like this.
   nextAnimation(animation);
}

function changeAnimation(color, animName) {
   if (sprites.players[color].state !== animName) {
      resetAnimation(animations[color + '_' + animName]);
   }
   sprites.players[color].state = animName;
}


ASSETS_LOADING.then(() => {

   ['white', 'black', 'orange', 'green'].forEach(color => {
      sprites
      sprites.players[color].data.inputs.forEach(input => {
         const name = input.filename.split('/')[0];
         animations[name] = {};
         animations[name].counter = 0;
         animations[name].data = [];
         input.sources.forEach(animIndex => {
            const index = animIndex.index;
            animations[name].data.push(sprites.players[color].data.sprites[index]);
         })
      });
   });



});