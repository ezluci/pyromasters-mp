import { socket } from "./game-socket";
import { switchedKeys } from "./game-variables";
import { chatInputElm, isMobile } from "./page";

type InputActionMove = 'up' | 'left' | 'down' | 'right';
type InputActionAll = InputActionMove | 'bomb';

type DirKey = 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD' | 'ArrowUp' | 'ArrowLeft' | 'ArrowDown' | 'ArrowRight';
type BombKey = 'KeyP' | 'Space';
type Key = DirKey | BombKey;

const revKey: {
   [K in DirKey]: DirKey
} = {
   KeyW: 'KeyS',
   KeyA: 'KeyD',
   KeyS: 'KeyW',
   KeyD: 'KeyA',
   ArrowUp: 'ArrowDown',
   ArrowLeft: 'ArrowRight',
   ArrowDown: 'ArrowUp',
   ArrowRight: 'ArrowLeft'
};

const revAction: {
   [A in InputActionMove]: InputActionMove
} = {
   up: 'down',
   left: 'right',
   down: 'up',
   right: 'left'
};

const keyToInputAction: {
   [K in Key]: InputActionAll
} = {
   KeyW: 'up',
   KeyA: 'left',
   KeyS: 'down',
   KeyD: 'right',
   ArrowUp: 'up',
   ArrowLeft: 'left',
   ArrowDown: 'down',
   ArrowRight: 'right',
   KeyP: 'bomb',
   Space: 'bomb'
};

// it's not actually all the keys that are pressed...
// this tells us what is the last dirkey pressed,
// it makes it easier to handle movement.
export const keysPressed: {
   [K in InputActionAll]: boolean
} = {
   up: false,
   left: false,
   down: false,
   right: false,
   bomb: false
};


      /// PC KEYS

if (!isMobile) {
   // chat shortcuts

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

   // non-chat keys

   const moveKeyQueue: DirKey[] = [];
   const bombKeyPressed: {
      [K in BombKey]: boolean
   } = {
      KeyP: false,
      Space: false
   };

   function updateKeysPressed() {
      keysPressed.up = keysPressed.left = keysPressed.down = keysPressed.right = keysPressed.bomb = false;
      if (moveKeyQueue.length === 1 || moveKeyQueue.length === 2) {
         const lastKey = moveKeyQueue[moveKeyQueue.length - 1];
         keysPressed[ keyToInputAction[lastKey] ] = true;
      }
      if (bombKeyPressed.KeyP || bombKeyPressed.Space) {
         keysPressed.bomb = true;
      }
   }


   document.addEventListener('keydown', (event) => {
      if (document.activeElement === chatInputElm) {
         return;
      }
      let code = event.code;
      
      if (code === 'KeyT' || code === 'Enter') {
         chatShortcut = true;
         chatInputElm.focus();
         return;
      }

      if (code === 'Space' || code === 'ArrowDown') {
         event.preventDefault();
      }

      let dirKey: DirKey | null = null;
      if (code === 'KeyW' || code === 'ArrowUp' ||
            code === 'KeyA' || code === 'ArrowLeft' ||
            code === 'KeyS' || code === 'ArrowDown' ||
            code === 'KeyD' || code === 'ArrowRight'
      ) {
         dirKey = code;
      } else if (code === 'KeyP' || code === 'Space') {
         bombKeyPressed[code] = true;
      }

      if (dirKey) {
         if (switchedKeys) {
            dirKey = revKey[dirKey];
         }
         if (moveKeyQueue.filter(key => key === dirKey).length === 0) {
            moveKeyQueue.push(dirKey);
         }
      }

      updateKeysPressed();
   });

   document.addEventListener('keyup', (event) => {
      let code = event.code;

      let dirKey: DirKey | null = null;
      if (code === 'KeyW' || code === 'ArrowUp' ||
            code === 'KeyA' || code === 'ArrowLeft' ||
            code === 'KeyS' || code === 'ArrowDown' ||
            code === 'KeyD' || code === 'ArrowRight'
      ) {
         dirKey = code;
      } else if (code === 'KeyP' || code === 'Space') {
         bombKeyPressed[code] = false;
      }

      if (dirKey) {
         if (switchedKeys) {
            dirKey = revKey[dirKey];
         }
         const idx = moveKeyQueue.indexOf(dirKey);
         if (idx !== -1) {
            moveKeyQueue.splice(idx, 1);
         }
      }

      updateKeysPressed();
   });

   document.addEventListener('switchkeyschange', () => {
      for (let i = 0; i < moveKeyQueue.length; ++i) {
         moveKeyQueue[i] = revKey[moveKeyQueue[i]];
      }
   });
}


      /// MOBILE KEYS

if (isMobile) {
   const butUp = document.querySelector('#button-up') as HTMLButtonElement;
   const butLeft = document.querySelector('#button-left') as HTMLButtonElement;
   const butDown = document.querySelector('#button-down') as HTMLButtonElement;
   const butRight = document.querySelector('#button-right') as HTMLButtonElement;
   const butBomb = document.querySelector('#button-bomb') as HTMLButtonElement;

   // on phone, we allow only one button pressed at once
   let buttonPressed: HTMLButtonElement | null = null;
   const movingButtons: { button: HTMLButtonElement, action: InputActionMove }[] = [
      { button: butUp, action: 'up' },
      { button: butLeft, action: 'left' },
      { button: butRight, action: 'right' },
      { button: butDown, action: 'down' }
   ];

   butBomb.addEventListener('touchstart', () => {
      keysPressed.bomb = true;
   });

   butBomb.addEventListener('touchend', () => {
      keysPressed.bomb = false;
   });

   movingButtons.forEach(({ button, action }) => {
      button.addEventListener('touchstart', () => {
         if (buttonPressed) { // if exists, remove the last press
            buttonPressed.dispatchEvent(new Event('touchend'));
         }

         const realAction = (switchedKeys ? revAction[action] : action);
         keysPressed[realAction] = true;
         buttonPressed = button;
      });

      button.addEventListener('touchend', () => {
         if (button !== buttonPressed) {
            return;
         }

         const realAction = (switchedKeys ? revAction[action] : action);
         keysPressed[realAction] = false;
         buttonPressed = null;
      });
   });

   document.addEventListener('switchkeyschange', () => {
      [keysPressed.left, keysPressed.right] = [keysPressed.right, keysPressed.left];
      [keysPressed.up, keysPressed.down] = [keysPressed.down, keysPressed.up];
   });
}