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

function drawAnimation(animation, dx, dy) {
   const spriteData = animation.data[animation.counter].rect;
   ctx.drawImage(sprites.players.green.img, spriteData.x, spriteData.y, spriteData.w, spriteData.h, OFFSET_LEFT + dx, OFFSET_UP + dy - 25, 53, 78);
   nextAnimation(animation);
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