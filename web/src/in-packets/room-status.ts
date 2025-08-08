import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "../game-consts";
import { Color, RoomStatus } from "../game-types";
import { bombs, colors, flames, setEndScreen, setRoomStatus } from "../game-variables";
import { audio } from "../load-assets";
import { menuSoundId, powerupsDOM, powerupsMainDOM, roomStatusElm, selectColorsElm, selectMapElm, setMenuSoundId } from "../page";

export function processPacket_roomStatus(packet: Uint8Array) {
   let idx = 1;

   const status: RoomStatus = packet[idx];
   setRoomStatus(status);
   roomStatusElm.innerText = 'room status: ' + (
      status === RoomStatus.WAITING ?' waiting' :
      status === RoomStatus.STARTING ? 'starting' :
      'running'
   );

   if (status === RoomStatus.WAITING) {
      powerupsMainDOM.hidden = true;
      selectColorsElm.hidden = false;
      selectMapElm.hidden = false;
      Object.values(Color).forEach(color => {
         if (colors[color]) {
            colors[color].dead = true;
            powerupsDOM[color].main.style.display = 'none';
         }
      });
   } else if (status === RoomStatus.STARTING) {
      bombs.length = 0;
      for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
         for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
            flames[y][x] = 0;
         }
      }
      powerupsMainDOM.hidden = false;
      selectColorsElm.hidden = true;
      selectMapElm.hidden = true;
   } else if (status === RoomStatus.RUNNING) {
      powerupsMainDOM.hidden = false;
      selectColorsElm.hidden = true;
      selectMapElm.hidden = true;
      setEndScreen(null);
      if (menuSoundId) {
         audio.stop(menuSoundId);
         setMenuSoundId(null);
      }
   }
}