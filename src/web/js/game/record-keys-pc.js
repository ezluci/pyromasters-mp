'use strict';

lastPressed = ''; // we use this to determine the direction in case of 2 keys pressed

document.onkeydown = (event) => {
   if (document.activeElement === document.querySelector('#chat-input')) {
      return;
   }
   let code = event.code

   if (switchedKeys) {
      switch (code) {
         case 'KeyA':   code = 'KeyD'; break;
         case 'KeyS':   code = 'KeyW'; break;
         case 'KeyD':   code = 'KeyA'; break;
         case 'KeyW':   code = 'KeyS'; break;
      }
   }

   switch (code) {
      case 'KeyA':   keys.a = 1; lastPressed = 'a'; break;
      case 'KeyS':   keys.s = 1; lastPressed = 's'; break;
      case 'KeyD':   keys.d = 1; lastPressed = 'd'; break;
      case 'KeyW':   keys.w = 1; lastPressed = 'w'; break;
      case 'KeyP':   keys.p = 1; break;
   }
}

document.onkeyup = (event) => {
   let code = event.code

   if (switchedKeys) {
      switch (code) {
         case 'KeyA':   code = 'KeyD'; break;
         case 'KeyS':   code = 'KeyW'; break;
         case 'KeyD':   code = 'KeyA'; break;
         case 'KeyW':   code = 'KeyS'; break;
      }
   }

   switch (code) {
      case 'KeyA':   keys.a = 0; (lastPressed === 'a' ? lastPressed = '' :1); break;
      case 'KeyS':   keys.s = 0; (lastPressed === 's' ? lastPressed = '' :1); break;
      case 'KeyD':   keys.d = 0; (lastPressed === 'd' ? lastPressed = '' :1); break;
      case 'KeyW':   keys.w = 0; (lastPressed === 'w' ? lastPressed = '' :1); break;
      case 'KeyP':   keys.p = 0; break;
   }
}

document.addEventListener('switchkeyschange', (event) => {
   if (keys.a + keys.d === 1) {
      [keys.a, keys.d] = [keys.d, keys.a];
   }
   if (keys.w + keys.s === 1) {
      [keys.w, keys.s] = [keys.s, keys.w];
   }
   
   switch (lastPressed) {
      case 'w':   lastPressed = 's'; break;
      case 'a':   lastPressed = 'd'; break;
      case 's':   lastPressed = 'w'; break;
      case 'd':   lastPressed = 'a'; break;
   }
});