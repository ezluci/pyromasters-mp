import type { Game } from "../..";
import { Resources } from "../../resources";

export function processPacket_playSound(packet: Uint8Array, g: Game) {
   const soundIndex = packet[1];
   const soundName = Resources.soundNames[soundIndex];

   const id = Resources.audio.play(soundName);

   if (soundName === 'draw' || soundName.startsWith('draw_') ||
         soundName === 'win' || soundName.startsWith('win_')) {
      Resources.audio.on('end', () => {
         if (g.menuSoundId !== null) {
            Resources.audio.stop(g.menuSoundId);
         }
         g.menuSoundId = Resources.audio.play('menu');
         Resources.audio.loop(true, g.menuSoundId);
      }, id);
   }

   if (soundName === 'menu') {
      if (g.menuSoundId !== null) {
         Resources.audio.stop(g.menuSoundId);
      }
      g.menuSoundId = id;
      Resources.audio.loop(true, g.menuSoundId);
   }
}