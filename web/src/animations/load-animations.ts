async function loadAnimationSprite() {
   const spriteImg = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = '/assets/images/animations/spritesheet.png';
   });

   const spriteData = await fetch('/assets/images/animations/spritesheet.json').then(file => file.json());

   return {
      img: spriteImg,
      data: spriteData,
   };
};

export const ANIMATION_SPRITE = await loadAnimationSprite();