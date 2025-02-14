'use strict';

const sprites = {};


sprites.players = {};

['white', 'black', 'orange', 'green'].forEach(color => {
   sprites.players[color] = {};
   loadImage('/assets/images/animations/spritesheet.png').then(img => {
      sprites.players[color].img = img;
      LOADED_COUNT ++;
   });
   fetch('/assets/images/animations/spritesheet.json').then(file => {
      file.json().then(data => {
         sprites.players[color].data = data;
         LOADED_COUNT ++;
      });
   });
   sprites.players[color].state = 'idle'; // the state of animations is handled in movement.js
})