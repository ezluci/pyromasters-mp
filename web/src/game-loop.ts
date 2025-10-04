import { BLOCK_SIZE, MAP_FOURWAY_NEXT_PORTAL, MAP_FOURWAY_PORTAL_POSITIONS } from "./game-consts";
import { Map, RoomStatus } from "./types";
import { moveDown, moveLeft, moveRight, moveUp } from "./movement";
import { sendPacket_placeBomb } from "./network/out-packets/place-bomb";
import { sendPacket_portalTp } from "./network/out-packets/portal-tp";
import { sendPacket_coords } from "./network/out-packets/coords";
import type { Game } from "./game";
import { Keys } from "./keys";
import { Resources } from "./resources";
import { Dom } from "./dom";
import { Animations } from "./animations";


let lastBombTime = -10000;
let lastFrameTime = performance.now();

export function gameLoop(g: Game) {

   const currentTime = performance.now();

   // calculate deltaTime
   g.deltaTime = currentTime - lastFrameTime;
   lastFrameTime = currentTime;

   /// UPDATES
   if (g.myPlayer.color && !g.myPlayer.dead && g.roomStatus === RoomStatus.RUNNING) {
      // place bomb
      if (Keys.keysPressed.bomb && currentTime - lastBombTime > 100) {
         sendPacket_placeBomb(g);
         lastBombTime = currentTime;
      }
      
      // move
      const me = g.myPlayer.coords;
      const meOld = { x: me.x, y: me.y };

      if (Keys.keysPressed.left) {
         moveLeft(g);
      } else if (Keys.keysPressed.down) {
         moveDown(g);
      } else if (Keys.keysPressed.right) {
         moveRight(g);
      } else if (Keys.keysPressed.up) {
         moveUp(g);
      } else {
         const currentAnimation = g.myPlayer.animState;
         if (currentAnimation >= 4) { // if walking
            Animations.changeAnimation(g.myPlayer, currentAnimation - 4);
         }
      }

      // check if the player went through any fourway portals

      if (g.map === Map.FOURWAY && (me.x === meOld.x || me.y === meOld.y) && (me.x !== meOld.x || me.y !== meOld.y)) {
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
            sendPacket_portalTp(g);
            me.x = MAP_FOURWAY_NEXT_PORTAL[portalIdx].x * BLOCK_SIZE;
            me.y = MAP_FOURWAY_NEXT_PORTAL[portalIdx].y * BLOCK_SIZE;
         }
      }

      sendPacket_coords(g, me.x, me.y, g.myPlayer.animState);
   }



   /// DRAWING
   if (g.endScreen) {
      g.ctx.drawImage(Resources.images.endscreens[g.endScreen], 0, 0, Dom.canvas.width, Dom.canvas.height);
      // let k = 50;
      // ranking.forEach(({ name, wins, kills }) => {
      //    ctx.fillText(`${name}: ${wins} wins      ${kills} kills`, 50, k);
      //    k += 50;
      // });
   }
   else {
      g.drawFrame();
   }

   requestAnimationFrame(() => gameLoop(g));
}