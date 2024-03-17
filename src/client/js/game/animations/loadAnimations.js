const sprite = await loadImage('/assets/images/animations/spritesheet.png');
const spriteData = await (await fetch('/assets/images/animations/spritesheet.json')).json();
console.log(spriteData);
// sprite.src = '/assets/images/animations/spritesheet.png';