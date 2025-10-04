import { Dom } from "./dom";
import { Animation, Color, Player } from "./types";

export type AnimationInfo = {
   // name: Animation, // what kind of animation is this
   color: Color,
   spriteInfos: any[], // infos about each frame on the spritesheet
   startTime: number // the time it started
};

type AnimationsType = {
   [C in Color]: {
      [A in Animation]: AnimationInfo
   }
};

export class Animations {
   static sprite: {
      img: HTMLImageElement,
      data: any;
   };
   static animations: AnimationsType;

   static async init() {
      this.sprite = {} as any;

      this.sprite.img = await new Promise<HTMLImageElement>((resolve, reject) => {
         const img = new Image();
         img.onload = () => resolve(img);
         img.onerror = reject;
         img.src = '/assets/images/animations/spritesheet.png';
      });

      this.sprite.data = await fetch('/assets/images/animations/spritesheet.json').then(file => file.json());
      
      this.animations = {} as AnimationsType;
      this.sprite.data.inputs.forEach((input: any) => {
         const fullName = input.filename.split('/')[1] as string;
         const color: Color = fullName.split('_')[0] as Color;
         const name: string = (fullName.split('_')[1] + '_' + fullName.split('_')[2]).toUpperCase();
         const anim: Animation = Object.values(Animation).indexOf(name);

         if (!this.animations[color]) {
            this.animations[color] = {} as any;
         }
         this.animations[color][anim] = {} as AnimationInfo;
         this.animations[color][anim].color = color;
         this.animations[color][anim].startTime = 0;
         this.animations[color][anim].spriteInfos = [];
         input.sources.forEach((source: any) => {
            const index = source.index as number;
            this.animations[color][anim].spriteInfos.push(this.sprite.data.sprites[index]);
         })
      });

      Dom.addLog('Animations loaded');
   }

   // change a player's animation
   static changeAnimation(player: Player, animation: Animation) {
      if (!player.color || player.animState === animation) {
         return;
      }
      this.animations[player.color][animation].startTime = performance.now();
      player.animState = animation;
   }
}