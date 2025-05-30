import { playerAnimations } from "./animations/load-animations";
import { changeAnimation } from "./animations/process-animations";
import { drawFrame } from "./game-canvas";
import { BLOCK_SIZE, MAP_FOURWAY_NEXT_PORTAL, MAP_FOURWAY_PORTAL_POSITIONS } from "./game-consts";
import { socket } from "./game-socket";
import { Animation, Coord, Map, RoomStatus } from "./game-types";
import { images } from "./load-assets";
import { moveDown, moveLeft, moveRight, moveUp } from "./movement";
import { coords, endScreen, mapName, myColor, ranking, roomStatus, setDeltaTime } from "./game-variables";
import { canvasElm, ctx } from "./page";
import { keysPressed } from "./record-keys";


let lastBombTime = -10000;
let lastFrameTime = performance.now();

export function gameLoop() {

   const currentTime = performance.now();

   // calculate deltaTime
   setDeltaTime(currentTime - lastFrameTime);
   lastFrameTime = currentTime;

   /// UPDATES
   if (myColor && roomStatus === RoomStatus.RUNNING) {

      // place bomb
      if (keysPressed.bomb && currentTime - lastBombTime > 100) {
         socket.emit('tryPlaceBomb');
         lastBombTime = currentTime;
      }

      // move
      const me = coords[myColor];
      const meOld: Coord = { x: me.x, y: me.y };

      if (keysPressed.left) {
         moveLeft();
      } else if (keysPressed.down) {
         moveDown();
      } else if (keysPressed.right) {
         moveRight();
      } else if (keysPressed.up) {
         moveUp();
      } else {
         const currentAnimation = playerAnimations.states[myColor];
         if (currentAnimation.split('_')[0] === 'walk') {
            changeAnimation(myColor, ('idle_' + currentAnimation.split('_')[1]) as Animation);
         }
      }

      // check if the player went through any fourway portals

      if (mapName === Map.FOURWAY && (me.x === meOld.x || me.y === meOld.y) && (me.x !== meOld.x || me.y !== meOld.y)) {
         let A, B, dif;
         if (me.x !== meOld.x) {
            A = me.x;
            B = meOld.x;
            dif = 1;
         } else {
            A = me.y;
            B = meOld.y;
            dif = 2;
         }
         if (A > B) {
            [A, B] = [B, A];
         }

         let portalIdx: number | null = null;
         MAP_FOURWAY_PORTAL_POSITIONS.forEach(({x, y}, idx) => {
            x *= BLOCK_SIZE;
            y *= BLOCK_SIZE;
            if ((me.x === x && me.y === y) ||
                  (dif === 1 && me.y === y && A < x && x < B) ||
                  (dif === 2 && me.x === x && A < y && y < B)) {
               portalIdx = idx;
            }
         });

         if (portalIdx !== null) {
            socket.emit('portaltp');
            me.x = MAP_FOURWAY_NEXT_PORTAL[portalIdx].x * BLOCK_SIZE;
            me.y = MAP_FOURWAY_NEXT_PORTAL[portalIdx].y * BLOCK_SIZE;
         }
      }
      
      socket.emit('coords', me.x, me.y, playerAnimations.states[myColor]);
   }



   /// DRAWING
   if (endScreen) {
      ctx.drawImage(images.endscreens[endScreen], 0, 0, canvasElm.width, canvasElm.height);
      let k = 50;
      ranking.forEach(({ name, wins, kills }) => {
         ctx.fillText(`${name}: ${wins} wins      ${kills} kills`, 50, k);
         k += 50;
      });
   }
   else {
      drawFrame();
   }

   window.requestAnimationFrame(gameLoop);
}