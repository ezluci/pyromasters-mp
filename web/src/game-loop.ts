import { changeAnimation } from "./animations/process-animations";
import { drawFrame } from "./game-canvas";
import { BLOCK_SIZE, MAP_FOURWAY_NEXT_PORTAL, MAP_FOURWAY_PORTAL_POSITIONS } from "./game-consts";
import { Map, RoomStatus } from "./game-types";
import { images } from "./load-assets";
import { moveDown, moveLeft, moveRight, moveUp } from "./movement";
import { endScreen, map, myPlayer, ranking, roomStatus, setDeltaTime } from "./game-variables";
import { canvasElm, ctx } from "./page";
import { keysPressed } from "./record-keys";
import { sendPacket_placeBomb } from "./out-packets/place-bomb";
import { sendPacket_portalTp } from "./out-packets/portal-tp";
import { sendPacket_coords } from "./out-packets/coords";


let lastBombTime = -10000;
let lastFrameTime = performance.now();

export function gameLoop() {

   const currentTime = performance.now();

   // calculate deltaTime
   setDeltaTime(currentTime - lastFrameTime);
   lastFrameTime = currentTime;

   /// UPDATES
   if (myPlayer && myPlayer.color && !myPlayer.dead && roomStatus === RoomStatus.RUNNING) {
      // place bomb
      if (keysPressed.bomb && currentTime - lastBombTime > 100) {
         sendPacket_placeBomb();
         lastBombTime = currentTime;
      }
      
      // move
      const me = myPlayer.coords;
      const meOld = { x: me.x, y: me.y };

      if (keysPressed.left) {
         moveLeft();
      } else if (keysPressed.down) {
         moveDown();
      } else if (keysPressed.right) {
         moveRight();
      } else if (keysPressed.up) {
         moveUp();
      } else {
         const currentAnimation = myPlayer.animState;
         if (currentAnimation >= 4) { // if walking
            changeAnimation(myPlayer, currentAnimation - 4);
         }
      }

      // check if the player went through any fourway portals

      if (map === Map.FOURWAY && (me.x === meOld.x || me.y === meOld.y) && (me.x !== meOld.x || me.y !== meOld.y)) {
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
            sendPacket_portalTp();
            me.x = MAP_FOURWAY_NEXT_PORTAL[portalIdx].x * BLOCK_SIZE;
            me.y = MAP_FOURWAY_NEXT_PORTAL[portalIdx].y * BLOCK_SIZE;
         }
      }

      sendPacket_coords(me.x, me.y, myPlayer.animState);
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

   requestAnimationFrame(gameLoop);
}