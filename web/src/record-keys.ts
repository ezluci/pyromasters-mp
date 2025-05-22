import { socket } from "./game-socket";
import { switchedKeys } from "./game-variables";
import { chatInputElm, isMobile } from "./page";

const revKey: {
   [K in Key]: Key
} = { a: 'd', d: 'a', w: 's', s: 'w' };
type Key = 'w' | 'a' | 's' | 'd';

export let keyPressQueue: Key[] = [];
export let keypressPlaceBomb: boolean = false;



if (!isMobile) {
   let chatShortcut: boolean = false;

   chatInputElm.addEventListener('keypress', (event) => {
      if (chatShortcut) {
         event.preventDefault();
         chatShortcut = false;
         return;
      }

      if (event.key === 'Enter') {
         event.preventDefault();
         socket.emit('chat', chatInputElm.value);
         chatInputElm.value = '';
         document.body.focus();
      }
   });

   chatInputElm.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
         event.preventDefault();
         document.body.focus();
      }
   });


   document.onkeydown = (event) => {
      if (document.activeElement === chatInputElm) {
         return;
      }
      let code = event.code;
      
      if (code === 'KeyT' || code === 'Enter') {
         chatShortcut = true;
         chatInputElm.focus();
         return;
      }

      switch (code) {
         case 'KeyA':   code = 'a'; break;
         case 'KeyD':   code = 'd'; break;
         case 'KeyW':   code = 'w'; break;
         case 'KeyS':   code = 's'; break;
         case 'KeyP':   keypressPlaceBomb = true; return;
         default:    return;
      }

      if (switchedKeys) {
         code = revKey[code as Key];
      }

      if (keyPressQueue.filter(key => key === code).length === 0) {
         keyPressQueue.push(code as Key);
      }
   }

   document.onkeyup = (event) => {
      let code = event.code;

      switch (code) {
         case 'KeyA':   code = 'a'; break;
         case 'KeyD':   code = 'd'; break;
         case 'KeyW':   code = 'w'; break;
         case 'KeyS':   code = 's'; break;
         case 'KeyP':   keypressPlaceBomb = false; break;
      }

      if (switchedKeys) {
         code = revKey[code as Key];
      }
      
      keyPressQueue = keyPressQueue.filter(key => key !== code);
   }

   document.addEventListener('switchkeyschange', () => {
      for (let i = 0; i < keyPressQueue.length; i += 1) {
         keyPressQueue[i] = revKey[keyPressQueue[i]];
      }
   });
}


if (isMobile) {
   const butUp = document.querySelector('#button-up') as HTMLButtonElement;
   const butLeft = document.querySelector('#button-left') as HTMLButtonElement;
   const butDown = document.querySelector('#button-down') as HTMLButtonElement;
   const butRight = document.querySelector('#button-right') as HTMLButtonElement;
   const butBomb = document.querySelector('#button-bomb') as HTMLButtonElement;

   // on phone, we allow only one button pressed at once
   let buttonPressed: HTMLButtonElement | null = null;
   const movingButtons: { button: HTMLButtonElement, key: Key }[] = [
      { button: butUp, key: 'w' },
      { button: butLeft, key: 'a' },
      { button: butRight, key: 'd' },
      { button: butDown, key: 's' }
   ];

   butBomb.addEventListener('touchstart', () => {
      keypressPlaceBomb = true;
   });

   butBomb.addEventListener('touchend', () => {
      keypressPlaceBomb = false;
   });

   movingButtons.forEach(({ button, key }) => {
      button.addEventListener('touchstart', () => {
         if (buttonPressed) { // if exists, remove the last press
            buttonPressed.dispatchEvent(new Event('touchend'));
         }

         let key2 = key;
         if (switchedKeys) {
            key2 = revKey[key];
         }

         keyPressQueue[0] = key2;
         buttonPressed = button;
      });

      button.addEventListener('touchend', () => {
         if (button !== buttonPressed) {
            return;
         }

         keyPressQueue.pop();
         buttonPressed = null;
      });
   });

   document.addEventListener('switchkeyschange', () => {
      if (keyPressQueue.length) {
         keyPressQueue[0] = revKey[keyPressQueue[0]];
      }
   });
}