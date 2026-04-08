import { Howl } from 'howler';
import { Map } from "./types";
import { Dom } from './dom';


export class Resources {
   private static loaded = false;

   static soundNames: string[];
   static audio: Howl;

   static images: Images;
   
   static async load(): Promise<void> {
      if (this.loaded) {
         return;
      }
      this.loaded = true;

      this.soundNames = [];
      const spriteData = await fetch('/audiosprite.json').then(data => data.json()).then(data => data.sprite);
      Object.keys(spriteData).forEach((sound, index) => {
         this.soundNames[index] = sound as string;
      });

      this.audio = await new Promise<Howl>((resolve, reject) => {
         const audio = new Howl({
            src: ['/audiosprite.webm'],
            sprite: spriteData,
            onload: () => resolve(audio),
            onloaderror: (_, err) => reject(err)
         });
      });


      this.images = {} as any;
      this.images.maps = {} as any;
      this.images.maps.bricktown = {} as any;
      this.images.maps.fourway = {} as any;
      this.images.maps.magneto = {} as any;
      this.images.powers = {} as any;
      this.images.endscreens = {} as any;

      await Promise.all([
         // map bricktown
         loadImage('/images/map_bricktown/background.jpg').then(img => this.images.maps.bricktown.background = img),
         loadImage('/images/map_bricktown/permanent.png').then(img => this.images.maps.bricktown.permanent = img),
         loadImage('/images/map_bricktown/normal.png').then(img => this.images.maps.bricktown.normal = img),

         // map fourway
         loadImage('/images/map_fourway/background.jpg').then(img => this.images.maps.fourway.background = img),
         loadImage('/images/map_fourway/permanent.jpg').then(img => this.images.maps.fourway.permanent = img),
         loadImage('/images/map_fourway/normal.jpg').then(img => this.images.maps.fourway.normal = img),
         loadImage('/images/map_fourway/portal.png').then(img => this.images.maps.fourway.portal = img),

         // map magneto
         loadImage('/images/map_magneto/background.jpg').then(img => this.images.maps.magneto.background = img),
         loadImage('/images/map_magneto/permanent.png').then(img => this.images.maps.magneto.permanent = img),
         loadImage('/images/map_magneto/normal.png').then(img => this.images.maps.magneto.normal = img),

         // misc
         loadImage('/images/players/shield.png').then(img => this.images.shield = img),
         loadImage('/images/blocks/bomb.png').then(img => this.images.bomb = img),
         loadImage('/images/blocks/fire.png').then(img => this.images.fire = img),

         // powerups
         loadImage('/images/blocks/powerup.png').then(img => this.images.powers.main = img),
         loadImage('/images/blocks/power_bombplus.png').then(img => this.images.powers.bombplus = img),
         loadImage('/images/blocks/power_bomblength.png').then(img => this.images.powers.bomblength = img),
         loadImage('/images/blocks/power_speed.png').then(img => this.images.powers.speed = img),
         loadImage('/images/blocks/power_shield.png').then(img => this.images.powers.shield = img),
         loadImage('/images/blocks/power_kickbombs.png').then(img => this.images.powers.kickbombs = img),
         loadImage('/images/blocks/power_bombtime.png').then(img => this.images.powers.bombtime = img),
         loadImage('/images/blocks/power_switchplayer.png').then(img => this.images.powers.switchplayer = img),
         loadImage('/images/blocks/power_sick.png').then(img => this.images.powers.sick = img),
         loadImage('/images/blocks/power_bonus.png').then(img => this.images.powers.bonus = img),

         // endscreens
         loadImage('/images/endscreens/draw.jpg').then(img => this.images.endscreens.draw = img),
         loadImage('/images/endscreens/white.jpg').then(img => this.images.endscreens.white = img),
         loadImage('/images/endscreens/black.jpg').then(img => this.images.endscreens.black = img),
         loadImage('/images/endscreens/orange.jpg').then(img => this.images.endscreens.orange = img),
         loadImage('/images/endscreens/green.jpg').then(img => this.images.endscreens.green = img)
      ]);

      Dom.addLog('Resources loaded');
   }
}


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

// helper function
function loadImage(src: string): Promise<HTMLImageElement> {
   return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
   });
}