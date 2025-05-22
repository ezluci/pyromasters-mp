import { Animation, Color } from '../game-types';

type PlayerAnimations = {
   spriteImg: HTMLImageElement,
   spriteData: any,
   states: {
      [K in Color]: Animation
   }
};

async function loadAnimations(): Promise<PlayerAnimations> {
   const spriteImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = '/assets/images/animations/spritesheet.png';
   });

   const spriteData = await fetch('/assets/images/animations/spritesheet.json').then(file => file.json());

   return {
      spriteImg: spriteImg,
      spriteData: spriteData,
      states: {
         [Color.WHITE]: Animation.IDLE_FRONT,
         [Color.BLACK]: Animation.IDLE_FRONT,
         [Color.ORANGE]: Animation.IDLE_FRONT,
         [Color.GREEN]: Animation.IDLE_FRONT
      }
   };
};

export const playerAnimations = await loadAnimations();