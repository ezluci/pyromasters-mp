'use strict';

const butUp = document.querySelector('#button-up');
const butLeft = document.querySelector('#button-left');
const butDown = document.querySelector('#button-down');
const butRight = document.querySelector('#button-right');
const butBomb = document.querySelector('#button-bomb');
const revKey = { a: 'd', d: 'a', w: 's', s: 'w' };

// on phone, we allow only one button pressed at once
let buttonPressed = undefined;
const movingButtons = [[butUp, 'w'], [butLeft, 'a'], [butRight, 'd'], [butDown, 's']];

butBomb.addEventListener('touchstart', (event) => {
   keys_p = 1;
});

butBomb.addEventListener('touchend', (event) => {
   keys_p = 0;
});

movingButtons.forEach(([button, key], idx) => {
   button.addEventListener('touchstart', (event) => {
      if (buttonPressed) { // if exists, remove the last press
         buttonPressed.dispatchEvent(new Event('touchend'));
      }
      if (switchedKeys) {
         key = revKey[key];
      }

      keyPressQueue[0] = key;
      buttonPressed = button;
   });

   button.addEventListener('touchend', (event) => {
      if (button !== buttonPressed) {
         return;
      }
      if (switchedKeys) {
         key = revKey[key];
      }

      keyPressQueue.pop();
      buttonPressed = undefined;
   });
});

document.addEventListener('switchkeyschange', (event) => {
   for (let i = 0; i < keyPressQueue.length; i += 1) {
      keyPressQueue[i] = revKey[keyPressQueue[i]];
   }
});