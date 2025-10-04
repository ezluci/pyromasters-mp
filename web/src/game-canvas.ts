import { AnimationInfo, Animations } from "./animations";
import { Dom } from "./dom";
import type { Game } from "./game";
import { BLOCK_SIZE, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY, MAP_FOURWAY_PORTAL_POSITIONS, OFFSET_DOWN, OFFSET_LEFT, OFFSET_RIGHT, OFFSET_UP } from "./game-consts";
import { Resources } from "./resources";
import { Block, Map } from "./types";

// this function draws a block using block coordinates => xB=0..15 and yB=0.11
export function drawBlock(this: Game, image: HTMLImageElement, xBlock: number, yBlock: number, manualOffset?: number) {
   if (manualOffset === undefined) {
      manualOffset = 4;
   }
   // 53x53
   this.ctx.drawImage(
      image,
      OFFSET_LEFT + xBlock * BLOCK_SIZE + manualOffset,
      OFFSET_UP + yBlock * BLOCK_SIZE + manualOffset,
      BLOCK_SIZE - 2 * manualOffset,
      BLOCK_SIZE - 2 * manualOffset
   );
}

// this function draws a player using normal coordinates (NO OFFSET REQUIRED)
export function drawPlayer(this: Game, image: HTMLImageElement, x: number, y: number) { 
   // 53x78
   this.ctx.drawImage(
      image,
      OFFSET_LEFT + x,
      OFFSET_UP + y - 25,
      53,
      78
   );
}


export function drawAnimation(this: Game, animation: AnimationInfo, x: number, y: number) {
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
   this.ctx.drawImage(Animations.sprite.img, sx, sy, sw, sh, dx, dy, dw, dh);
   Animations.nextAnimation(animation);
}


export function drawFrame(this: Game) {
   this.ctx.fillStyle = '#203d37';
   this.ctx.fillRect(0, 0, Dom.canvas.width, Dom.canvas.height);

   if (this.map === null) {
      return;
   }
   
   // draw background
   this.ctx.drawImage(Resources.images.maps[this.map].background, OFFSET_LEFT, OFFSET_UP,
      Dom.canvas.width - OFFSET_LEFT - OFFSET_RIGHT, Dom.canvas.height - OFFSET_UP - OFFSET_DOWN);


   // draw map blocks
   for (let y = 0; y < BLOCKS_VERTICALLY; ++y)
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         if (this.map === Map.FOURWAY && MAP_FOURWAY_PORTAL_POSITIONS.filter(({ x: xx, y: yy }) => xx === x && yy === y).length === 1) {
            const portalImg = Resources.images.maps[this.map].portal;
            if (portalImg) {
               this.drawBlock(portalImg, x, y);
            }
         }
         
         switch (this.grid[x][y]) {
            case Block.NO:
               break;
            case Block.NORMAL:
               this.drawBlock(Resources.images.maps[this.map].normal, x, y); break;
            case Block.PERMANENT:
               this.drawBlock(Resources.images.maps[this.map].permanent, x, y);  break;
            
            case Block.POWER_BOMBPLUS:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.bombplus, x, y);   break;
            case Block.POWER_BOMBLENGTH:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.bomblength, x, y); break;
            case Block.POWER_SPEED:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.speed, x, y);   break;
            case Block.POWER_SHIELD:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.shield, x, y);  break;
            case Block.POWER_KICKBOMBS:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.kickbombs, x, y);  break;
            case Block.POWER_BOMBTIME:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.bombtime, x, y);   break;
            case Block.POWER_SWITCHPLAYER:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.switchplayer, x, y);  break;
            case Block.POWER_SICK:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.sick, x, y); break;
            case Block.POWER_BONUS:
               this.drawBlock(Resources.images.powers.main, x, y);
               this.drawBlock(Resources.images.powers.bonus, x, y);   break;
         }
      }
   
   // draw bombs
   this.bombs.forEach(bomb => this.drawBlock(Resources.images.bomb, bomb.x, bomb.y, 0));

   // draw flames
   for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
      for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
         if (this.flames[x][y]) {
            this.drawBlock(Resources.images.fire, x, y, 0);
         }
      }
   }
   
   // draw players
   Object.values(this.colors).forEach(player => {
      if (!player || player.dead || !player.color) {
         return;
      }
      this.drawAnimation(Animations.animations[player.color][player.animState], player.x, player.y);
      if (player.shield) {
         this.drawPlayer(Resources.images.shield, player.x, player.y);
      }
   });

   // draw gametime
   const m = Math.floor(this.gameTime / 60).toString();
   const s = Math.floor(this.gameTime % 60).toString().padStart(2, '0');
   this.ctx.fillStyle = 'black';
   this.ctx.font = '30px serif';
   this.ctx.fillText(`${m}:${s}`, 750, 23);
}