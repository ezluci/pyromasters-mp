import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "../../game-consts";
import { Color, RoomStatus } from "../../types";
import { Game } from "../../game";
import { Dom } from "../../dom";
import { Resources } from "../../resources";

export function processPacket_roomStatus(packet: Uint8Array, g: Game) {
  let idx = 1;

  const status: RoomStatus = packet[idx];
  g.roomStatus = status;
  Dom.roomStatus.innerText = 'room status: ' + (
    status === RoomStatus.WAITING ?' waiting' :
    status === RoomStatus.STARTING ? 'starting' :
    'running'
  );

  if (status === RoomStatus.WAITING) {
    Dom.powerupsMain.hidden = true;
    if (!g.isGuest) {
      Dom.selectColors.hidden = false;
      Dom.selectMap.hidden = false;
    }
    Object.values(Color).forEach(color => {
      if (g.colors[color]) {
        g.colors[color].dead = true;
        Dom.powerups[color].main.style.display = 'none';
      }
    });
  } else if (status === RoomStatus.STARTING) {
    g.bombs.length = 0;
    for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
        for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
          g.flames[x][y] = 0;
        }
    }
    Dom.powerupsMain.hidden = false;
    if (!g.isGuest) {
      Dom.selectColors.hidden = true;
      Dom.selectMap.hidden = true;
    }
  } else if (status === RoomStatus.RUNNING) {
    Dom.powerupsMain.hidden = false;
    if (!g.isGuest) {
      Dom.selectColors.hidden = true;
      Dom.selectMap.hidden = true;
    }
    g.endScreen = null;
    if (g.menuSoundId) {
        Resources.audio.stop(g.menuSoundId);
        g.menuSoundId = null;
    }
  }
}