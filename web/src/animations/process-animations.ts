import { Animation, Color } from "../game-types";
import { playerAnimations } from "./load-animations";

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

   playerAnimations.spriteData.inputs.forEach((input: any) => {
      const fullName = input.filename.split('/')[0] as string;
      const color: Color = fullName.split('_')[0] as Color;
      const name: Animation = (fullName.split('_')[1] + '_' + fullName.split('_')[2]) as Animation;
      if (!animations[color]) {
         animations[color] = {} as any;
      }
      animations[color][name] = {} as AnimationInfo;
      animations[color][name].color = color;
      animations[color][name].name = name;
      animations[color][name].counter = 0;
      animations[color][name].spriteInfos = [];
      input.sources.forEach((source: any) => {
         const index = source.index as number;
         animations[color][name].spriteInfos.push(playerAnimations.spriteData.sprites[index]);
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
export function changeAnimation(color: Color, animation: Animation) {
   if (playerAnimations.states[color] === animation) {
      return;
   }
   resetAnimation(animations[color][animation]);
   playerAnimations.states[color] = animation;
}