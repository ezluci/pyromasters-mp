import { Howl } from 'howler';
import { Map } from "./game-types";

// helper function

function loadImage(src: string): Promise<HTMLImageElement> {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
   });
}


// Audio

async function loadAudio(): Promise<Howl> {
   const spriteData = await fetch('assets/audiosprite.json').then(data => data.json()).then(data => data.sprite);
   return new Promise<Howl>((resolve, reject) => {
      const audio = new Howl({
         src: ['assets/audiosprite.webm'],
         sprite: spriteData,
         onload: () => resolve(audio),
         onloaderror: (_, err) => reject(err)
      });
   });
}

export const audio = await loadAudio();

// Images

type MapImages = {
   background: HTMLImageElement,
   permanent: HTMLImageElement,
   normal: HTMLImageElement,
   portal?: HTMLImageElement
}

type Images = {
   maps: {
      [M in Map]: MapImages
   },
   shield: HTMLImageElement,
   bomb: HTMLImageElement,
   fire: HTMLImageElement,
   powers: {
      main: HTMLImageElement,
      bombplus: HTMLImageElement,
      bomblength: HTMLImageElement,
      speed: HTMLImageElement,
      shield: HTMLImageElement,
      kickbombs: HTMLImageElement,
      bombtime: HTMLImageElement,
      switchplayer: HTMLImageElement,
      sick: HTMLImageElement,
      bonus: HTMLImageElement
   }
   endscreens: {
      draw: HTMLImageElement,
      white: HTMLImageElement,
      black: HTMLImageElement,
      orange: HTMLImageElement,
      green: HTMLImageElement
   }
};

async function loadImages(): Promise<Images> {
   const images: Images = {} as Images;
   images.maps = {} as any;
   images.maps.bricktown = {} as any;
   images.maps.fourway = {} as any;
   images.maps.magneto = {} as any;
   images.powers = {} as any;
   images.endscreens = {} as any;

   await Promise.all([
      // map bricktown
      loadImage('assets/images/map_bricktown/background.jpg').then(img => images.maps.bricktown.background = img),
      loadImage('assets/images/map_bricktown/permanent.png').then(img => images.maps.bricktown.permanent = img),
      loadImage('assets/images/map_bricktown/normal.png').then(img => images.maps.bricktown.normal = img),

      // map fourway
      loadImage('assets/images/map_fourway/background.jpg').then(img => images.maps.fourway.background = img),
      loadImage('assets/images/map_fourway/permanent.jpg').then(img => images.maps.fourway.permanent = img),
      loadImage('assets/images/map_fourway/normal.jpg').then(img => images.maps.fourway.normal = img),
      loadImage('assets/images/map_fourway/portal.png').then(img => images.maps.fourway.portal = img),

      // map magneto
      loadImage('assets/images/map_magneto/background.jpg').then(img => images.maps.magneto.background = img),
      loadImage('assets/images/map_magneto/permanent.png').then(img => images.maps.magneto.permanent = img),
      loadImage('assets/images/map_magneto/normal.png').then(img => images.maps.magneto.normal = img),

      // misc
      loadImage('assets/images/players/shield.png').then(img => images.shield = img),
      loadImage('assets/images/blocks/bomb.png').then(img => images.bomb = img),
      loadImage('assets/images/blocks/fire.png').then(img => images.fire = img),

      // powerups
      loadImage('assets/images/blocks/powerup.png').then(img => images.powers.main = img),
      loadImage('assets/images/blocks/power_bombplus.png').then(img => images.powers.bombplus = img),
      loadImage('assets/images/blocks/power_bomblength.png').then(img => images.powers.bomblength = img),
      loadImage('assets/images/blocks/power_speed.png').then(img => images.powers.speed = img),
      loadImage('assets/images/blocks/power_shield.png').then(img => images.powers.shield = img),
      loadImage('assets/images/blocks/power_kickbombs.png').then(img => images.powers.kickbombs = img),
      loadImage('assets/images/blocks/power_bombtime.png').then(img => images.powers.bombtime = img),
      loadImage('assets/images/blocks/power_switchplayer.png').then(img => images.powers.switchplayer = img),
      loadImage('assets/images/blocks/power_sick.png').then(img => images.powers.sick = img),
      loadImage('assets/images/blocks/power_bonus.png').then(img => images.powers.bonus = img),

      // endscreens
      loadImage('assets/images/endscreens/draw.jpg').then(img => images.endscreens.draw = img),
      loadImage('assets/images/endscreens/white.jpg').then(img => images.endscreens.white = img),
      loadImage('assets/images/endscreens/black.jpg').then(img => images.endscreens.black = img),
      loadImage('assets/images/endscreens/orange.jpg').then(img => images.endscreens.orange = img),
      loadImage('assets/images/endscreens/green.jpg').then(img => images.endscreens.green = img)
   ]);

   return images;
}

export const images = await loadImages();