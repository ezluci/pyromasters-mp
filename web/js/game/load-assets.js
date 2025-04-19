'use strict';

const ASSETS_COUNT = 31;

// create a promise which you can use to check if assets are loaded
const ASSETS_LOADING = new Promise((resolve) => {
   let loaded = 0;

   document.addEventListener('loaded++', () => {
      loaded++;
      
      if (document.readyState !== 'loading') {
         document.querySelector('#loading').innerText = `Loading assets ${loaded}/${ASSETS_COUNT}...`;
      }

      if (loaded === ASSETS_COUNT) {
         if (document.readyState !== 'loading') {
            document.querySelector('#loading').innerText = `Loading assets ${ASSETS_COUNT}/${ASSETS_COUNT} ✅\nConnecting to the server...`
         }
         resolve();
      }
   });
});

/// LOADING SOUNDS

let audio;

fetch('assets/audiosprite.json')
   .then(response => response.json())
   .then(data => {

      audio = new Howl({
         src: ['assets/audiosprite.webm'],
         sprite: data.sprite,
         onload: () => { document.dispatchEvent(new CustomEvent('loaded++')) }
      });
   });



/// LOADING IMAGES

const images = {};

images.maps = {};

// loading map bricktown
images.maps.bricktown = {};

loadImage('assets/images/map_bricktown/background.jpg').then(image => {
   images.maps.bricktown.background = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/map_bricktown/permanent.png').then(image => {
   images.maps.bricktown.blockPermanent = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/map_bricktown/normal.png').then(image => {
   images.maps.bricktown.block = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})

// loading map fourway
images.maps.fourway = {};

loadImage('assets/images/map_fourway/background.jpg').then(image => {
   images.maps.fourway.background = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/map_fourway/permanent.jpg').then(image => {
   images.maps.fourway.blockPermanent = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/map_fourway/normal.jpg').then(image => {
   images.maps.fourway.block = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/map_fourway/portal.png').then(image => {
   images.maps.fourway.portal = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})

// loading map magneto
images.maps.magneto = {};

loadImage('assets/images/map_magneto/background.jpg').then(image => {
   images.maps.magneto.background = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/map_magneto/permanent.png').then(image => {
   images.maps.magneto.blockPermanent = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/map_magneto/normal.png').then(image => {
   images.maps.magneto.block = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})


// loading misc
loadImage('assets/images/players/shield.png').then(image => {
   images.shield = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/bomb.png').then(image => {
   images.bomb = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/fire.png').then(image => {
   images.fire = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})


// LOADING POWERUPS
images.powers = [];
loadImage('assets/images/blocks/powerup.png').then(image => {
   images.powers.main = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_bombplus.png').then(image => {
   images.powers.bombplus = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_bomblength.png').then(image => {
   images.powers.bomblength = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_speed.png').then(image => {
   images.powers.speed = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_shield.png').then(image => {
   images.powers.shield = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_kickbombs.png').then(image => {
   images.powers.kickbombs = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_bombtime.png').then(image => {
   images.powers.bombtime = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_switchplayer.png').then(image => {
   images.powers.switchplayer = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_sick.png').then(image => {
   images.powers.sick = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})
loadImage('assets/images/blocks/power_bonus.png').then(image => {
   images.powers.bonus = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
})

// endscreens
images.endscreens = [];
loadImage('assets/images/endscreens/draw.jpg').then(image => {
   images.endscreens.draw = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/endscreens/white.jpg').then(image => {
   images.endscreens.white = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/endscreens/black.jpg').then(image => {
   images.endscreens.black = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/endscreens/orange.jpg').then(image => {
   images.endscreens.orange = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});
loadImage('assets/images/endscreens/green.jpg').then(image => {
   images.endscreens.green = image;
   document.dispatchEvent(new CustomEvent('loaded++'));
});