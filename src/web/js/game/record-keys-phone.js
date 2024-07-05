'use strict';

const butUp = document.querySelector('#button-up');
const butLeft = document.querySelector('#button-left');
const butDown = document.querySelector('#button-down');
const butRight = document.querySelector('#button-right');
const butBomb = document.querySelector('#button-bomb');

// on phone, we allow only one button pressed at once
let buttonPressed = undefined;
const movingButtons = [[butUp, 'w'], [butLeft, 'a'], [butRight, 'd'], [butDown, 's']];

butBomb.addEventListener('touchstart', (event) => {
   keys.p = 1;
});

butBomb.addEventListener('touchend', (event) => {
   keys.p = 0;
});

movingButtons.forEach(([button, key], idx) => {
   const otherKey = movingButtons[movingButtons.length - idx - 1][1];

   button.addEventListener('touchstart', (event) => {
      if (buttonPressed) {
         buttonPressed.dispatchEvent(new Event('touchend'));
      }
      keys[(switchedKeys ? otherKey : key)] = 1;
      buttonPressed = button;
   });

   button.addEventListener('touchend', (event) => {
      if (button !== buttonPressed) {
         return;
      }
      keys[(switchedKeys ? otherKey : key)] = 0;
      buttonPressed = undefined;
   });
});

document.addEventListener('switchkeyschange', (event) => {
   if (buttonPressed) {
      keys.w = keys.a = keys.s = keys.d = 0;
      buttonPressed.dispatchEvent(new Event('touchstart'));
   }
});