import { ANIMATION_SPRITE } from "./animations/load-animations";
import { animations, nextAnimation, AnimationInfo } from "./animations/process-animations";
import { BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAP_FOURWAY_PORTAL_POSITIONS, OFFSET_DOWN, OFFSET_LEFT, OFFSET_RIGHT, OFFSET_UP } from "./game-consts";
import { Block, Map } from "./game-types";
import { bombs, colors, flames, gameTime, grid, map } from "./game-variables";
import { images } from "./load-assets";
import { canvasElm, ctx } from "./page";

// this function draws a block using block coordinates => xB=0..15 and yB=0.11
export function drawBlock(image: HTMLImageElement, xBlock: number, yBlock: number, manualOffset = 4) {
   // 53x53
   ctx.drawImage(
      image,
      OFFSET_LEFT + xBlock * BLOCK_SIZE + manualOffset,
      OFFSET_UP + yBlock * BLOCK_SIZE + manualOffset,
      BLOCK_SIZE - 2 * manualOffset,
      BLOCK_SIZE - 2 * manualOffset
   );
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
export function drawPlayer(image: HTMLImageElement, x: number, y: number) { 
   // 53x78
   ctx.drawImage(
      image,
      OFFSET_LEFT + x,
      OFFSET_UP + y - 25,
      53,
      78
   );
}


export function drawAnimation(animation: AnimationInfo, x: number, y: number) {
   const spriteData = animation.spriteInfos[animation.counter];
   const trimmedRect = spriteData.trimmedRect;
   const rect = spriteData.rect;

   const sx = trimmedRect.x;
   const sy = trimmedRect.y;
   const sw = trimmedRect.w;
   const sh = trimmedRect.h;
   const dx = OFFSET_LEFT + x + (trimmedRect.x - rect.x);
   const dy = OFFSET_UP + y + (trimmedRect.y - rect.y) - 25;
   const dw = sw; // if the animations didn't match this exact resolution, this wouldn't work. you need percentages.
   const dh = sh;
   ctx.drawImage(ANIMATION_SPRITE.img, sx, sy, sw, sh, dx, dy, dw, dh);
   nextAnimation(animation);
}


export function drawFrame() {
   ctx.fillStyle = '#203d37';
   ctx.fillRect(0, 0, canvasElm.width, canvasElm.height);

   if (map === null) {
      return;
   }
   
   // draw background
   ctx.drawImage(images.maps[map].background, OFFSET_LEFT, OFFSET_UP, canvasElm.width - OFFSET_LEFT - OFFSET_RIGHT, canvasElm.height - OFFSET_UP - OFFSET_DOWN);


   // draw map blocks
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y)
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         if (map === Map.FOURWAY && MAP_FOURWAY_PORTAL_POSITIONS.filter(({ x: xx, y: yy }) => xx === x && yy === y).length === 1) {
            const portalImg = images.maps[map].portal;
            if (portalImg) {
               drawBlock(portalImg, x, y);
            }
         }
         
         switch (grid[y][x]) {
            case Block.NO:
               break;
            case Block.NORMAL:
               drawBlock(images.maps[map].normal, x, y); break;
            case Block.PERMANENT:
               drawBlock(images.maps[map].permanent, x, y);  break;
            
            case Block.POWER_BOMBPLUS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bombplus, x, y);   break;
            case Block.POWER_BOMBLENGTH:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bomblength, x, y); break;
            case Block.POWER_SPEED:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.speed, x, y);   break;
            case Block.POWER_SHIELD:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.shield, x, y);  break;
            case Block.POWER_KICKBOMBS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.kickbombs, x, y);  break;
            case Block.POWER_BOMBTIME:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bombtime, x, y);   break;
            case Block.POWER_SWITCHPLAYER:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.switchplayer, x, y);  break;
            case Block.POWER_SICK:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.sick, x, y); break;
            case Block.POWER_BONUS:
               drawBlock(images.powers.main, x, y);
               drawBlock(images.powers.bonus, x, y);   break;
         }
      }
   
   // draw bombs
   bombs.forEach(bomb => drawBlock(images.bomb, bomb.x, bomb.y, 0));

   // draw flames
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         if (flames[y][x]) {
            drawBlock(images.fire, x, y, 0);
         }
      }
   }
   
   // draw players
   Object.values(colors).forEach(player => {
      if (!player || player.dead || !player.color) {
         return;
      }
      drawAnimation(animations[player.color][player.animState], player.coords.x, player.coords.y);
      if (player.shield) {
         drawPlayer(images.shield, player.coords.x, player.coords.y);
      }
   });

   // draw gametime
   const m = Math.floor(gameTime / 60).toString();
   const s = Math.floor(gameTime % 60).toString().padStart(2, '0');
   ctx.fillStyle = 'black';
   ctx.font = '30px serif';
   ctx.fillText(`${m}:${s}`, 750, 23);
}