'use strict';

const revKey = { a: 'd', d: 'a', w: 's', s: 'w' };

document.onkeydown = (event) => {
   if (document.activeElement === document.querySelector('#chat-input')) {
      return;
   }
   let code = event.code

   switch (code) {
      case 'KeyA':   code = 'a'; break;
      case 'KeyD':   code = 'd'; break;
      case 'KeyW':   code = 'w'; break;
      case 'KeyS':   code = 's'; break;
      case 'KeyP':   keys_p = 1; return;
      default:    return;
   }

   if (switchedKeys) {
      code = revKey[code];
   }

   if (keyPressQueue.filter(key => key === code).length === 0) {
      keyPressQueue.push(code);
   }
}

document.onkeyup = (event) => {
   let code = event.code

   switch (code) {
      case 'KeyA':   code = 'a'; break;
      case 'KeyD':   code = 'd'; break;
      case 'KeyW':   code = 'w'; break;
      case 'KeyS':   code = 's'; break;
      case 'KeyP':   keys_p = 0; break;
   }

   if (switchedKeys) {
      code = revKey[code];
   }
   
   keyPressQueue = keyPressQueue.filter(key => key !== code);
}

document.addEventListener('switchkeyschange', (event) => {
   for (let i = 0; i < keyPressQueue.length; i += 1) {
      keyPressQueue[i] = revKey[keyPressQueue[i]];
   }
});