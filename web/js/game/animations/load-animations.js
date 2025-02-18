'use strict';

const sprites = {};

sprites.playerAnimations = {};
loadImage('/assets/images/animations/spritesheet.png').then(img => {
   sprites.playerAnimations.img = img;
   LOADED_COUNT ++;
});
fetch('/assets/images/animations/spritesheet.json').then(file => {
   file.json().then(data => {
      sprites.playerAnimations.data = data;
      LOADED_COUNT ++;
   });
});

sprites.players = {};
['white', 'black', 'orange', 'green'].forEach(color => {
   sprites.players[color] = {};
   sprites.players[color].state = 'idle_front'; // the state of animations is handled in movement.js
})