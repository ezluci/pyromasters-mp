import { Animation, Color, Player } from "../game-types";
import { ANIMATION_SPRITE } from "./load-animations";

export type AnimationInfo = {
   name: Animation, // what kind of animation is this
   color: Color,
   spriteInfos: any[], // infos about each frame on the spritesheet
   counter: number // current frame index
};

type Animations = {
   [C in Color]: {
      [A in Animation]: AnimationInfo
   }
};


function processAnimations(): Animations {
   const animations: Animations = {} as Animations;

   ANIMATION_SPRITE.data.inputs.forEach((input: any) => {
      const fullName = input.filename.split('/')[1] as string;
      const color: Color = fullName.split('_')[0] as Color;
      const name: string = (fullName.split('_')[1] + '_' + fullName.split('_')[2]).toUpperCase();
      const anim: Animation = Object.values(Animation).indexOf(name);
      if (!animations[color]) {
         animations[color] = {} as any;
      }
      animations[color][anim] = {} as AnimationInfo;
      animations[color][anim].color = color;
      animations[color][anim].counter = 0;
      animations[color][anim].spriteInfos = [];
      input.sources.forEach((source: any) => {
         const index = source.index as number;
         animations[color][anim].spriteInfos.push(ANIMATION_SPRITE.data.sprites[index]);
      })
   });

   return animations;
};

export const animations = processAnimations();


export function nextAnimation(animation: AnimationInfo) {
   animation.counter ++;
   if (animation.counter === animation.spriteInfos.length) {
      animation.counter = 0;
   }
}

export function resetAnimation(animation: AnimationInfo) {
   animation.counter = 0;
}

// change a player's animation
export function changeAnimation(player: Player, animation: Animation) {
   if (!player.color || player.animState === animation) {
      return;
   }
   resetAnimation(animations[player.color][animation]);
   player.animState = animation;
}