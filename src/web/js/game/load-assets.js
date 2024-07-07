'use strict';


/// LOADING SOUNDS

const sounds = {};

sounds.menu = new Howl({
   src: ['assets/sounds/menu.mp3'],
   loop: true,
   onload: () => { LOADED_COUNT ++ }
});

sounds.hurry = [];
sounds.hurry.push(new Howl({
   src: ['assets/sounds/hurry.mp3'],
   onload: () => { LOADED_COUNT ++ }
}));

for (let i = 1; i <= 5; ++i) {
   sounds.hurry.push(new Howl({
      src: [`assets/sounds/hurry${i}.mp3`],
      onload: () => { LOADED_COUNT ++ }
   }));
}

sounds.taunt = [];
for (let i = 1; i <= 13; ++i) {
   sounds.taunt.push(new Howl({
      src: [`assets/sounds/taunt${i}.mp3`],
      onload: () => { LOADED_COUNT ++ }
   }));
}

sounds.dropBomb = new Howl({
   src: ['assets/sounds/dropbomb.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.dropBombSick = new Howl({
   src: ['assets/sounds/dropbombsick.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.walldrop = new Howl({
   src: ['assets/sounds/walldrop.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.explodeBomb = [];
for (let i = 1; i <= 4; ++i)
   sounds.explodeBomb.push(new Howl({
      src: [`assets/sounds/explode${i}.mp3`],
      onload: () => { LOADED_COUNT ++ }
   }));

sounds.powerup = new Howl({
   src: ['assets/sounds/powerup.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.bonusAll = new Howl({
   src: ['assets/sounds/bonusall.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.bonusLost = new Howl({
   src: ['assets/sounds/bonuslost.mp3'],
   onload: () => { LOADED_COUNT ++ }
});

sounds.dead = [];
for (let i = 1; i <= 5; ++i) {
   sounds.dead.push(new Howl({
      src: [`assets/sounds/dead${i}.mp3`],
      onload: () => { LOADED_COUNT ++ }
   }));
}

sounds.draw = [];
for (let i = 1; i <= 5; ++i) {
   sounds.draw.push(new Howl({
      src: [`assets/sounds/draw${i}.mp3`],
      onend: () => { sounds.menu.play() },
      onload: () => { LOADED_COUNT ++ }
   }));
}

sounds.win = [];
for (let i = 1; i <= 5; ++i) {
   sounds.win.push(new Howl({
      src: [`assets/sounds/win${i}.mp3`],
      onend: () => { sounds.menu.play() },
      onload: () => { LOADED_COUNT ++ }
   }));
}



/// LOADING IMAGES

const images = {};

images.maps = {};

// loading map bricktown
images.maps.bricktown = {};

loadImage('assets/images/map_bricktown/background.jpg').then(image => {
   images.maps.bricktown.background = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/map_bricktown/permanent.png').then(image => {
   images.maps.bricktown.blockPermanent = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/map_bricktown/normal.png').then(image => {
   images.maps.bricktown.block = image;
   LOADED_COUNT ++;
})

// loading map fourway
images.maps.fourway = {};

loadImage('assets/images/map_fourway/background.jpg').then(image => {
   images.maps.fourway.background = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/map_fourway/permanent.jpg').then(image => {
   images.maps.fourway.blockPermanent = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/map_fourway/normal.jpg').then(image => {
   images.maps.fourway.block = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/map_fourway/portal.png').then(image => {
   images.maps.fourway.portal = image;
   LOADED_COUNT ++;
})


// loading misc
loadImage('assets/images/players/shield.png').then(image => {
   images.shield = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/bomb.png').then(image => {
   images.bomb = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/fire.png').then(image => {
   images.fire = image;
   LOADED_COUNT ++;
})

images.powers = [];
loadImage('assets/images/blocks/powerup.png').then(image => {
   images.powers.main = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bombplus.png').then(image => {
   images.powers.bombplus = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bomblength.png').then(image => {
   images.powers.bomblength = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_speed.png').then(image => {
   images.powers.speed = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_shield.png').then(image => {
   images.powers.shield = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_kickbombs.png').then(image => {
   images.powers.kickbombs = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bombtime.png').then(image => {
   images.powers.bombtime = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_switchplayer.png').then(image => {
   images.powers.switchplayer = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_sick.png').then(image => {
   images.powers.sick = image;
   LOADED_COUNT ++;
})
loadImage('assets/images/blocks/power_bonus.png').then(image => {
   images.powers.bonus = image;
   LOADED_COUNT ++;
})

// endscreens
images.endscreens = [];
loadImage('assets/images/endscreens/draw.jpg').then(image => {
   images.endscreens.draw = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/white.jpg').then(image => {
   images.endscreens.white = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/black.jpg').then(image => {
   images.endscreens.black = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/orange.jpg').then(image => {
   images.endscreens.orange = image;
   LOADED_COUNT ++;
});
loadImage('assets/images/endscreens/green.jpg').then(image => {
   images.endscreens.green = image;
   LOADED_COUNT ++;
});


// create promise which checks if animations are loaded
const ASSETS_LOADING = new Promise((resolve) => {
   const intvid = setInterval(() => {
      if (LOADED_COUNT === 78) {
         resolve();
         clearInterval(intvid);
      }
   }, 60);
});

ASSETS_LOADING.then(() => {
   console.log('All assets loaded');
});