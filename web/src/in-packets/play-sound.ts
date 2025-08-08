import { audio, soundNames } from "../load-assets";
import { menuSoundId, setMenuSoundId } from "../page";

export function processPacket_playSound(packet: Uint8Array) {
   const soundIndex = packet[1];
   const soundName = soundNames[soundIndex];

   const id = audio.play(soundName);

   if (soundName === 'draw' || soundName.startsWith('draw_') ||
         soundName === 'win' || soundName.startsWith('win_')) {
      audio.on('end', () => {
         if (menuSoundId) {
            audio.stop(menuSoundId);
         }
         setMenuSoundId(audio.play('menu'));
         audio.loop(true, menuSoundId!);
      }, id);
   }

   if (soundName === 'menu') {
      if (menuSoundId) {
         audio.stop(menuSoundId);
      }
      setMenuSoundId(id);
      audio.loop(true, menuSoundId!);
   }
}