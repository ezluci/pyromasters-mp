import io from "socket.io-client";
import { Animation, Block, Color, type Coord, Map, RoomStatus } from "./game-types";
import { ALL_COLORS, BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { gameLoop } from "./game-loop";
import { audio } from "./load-assets";
import { playerAnimations } from "./animations/load-animations";
import { changeAnimation } from "./animations/process-animations";
import { addChatMessage, addLog, addPlayerToList, canvasElm, changePlayerFromList, chatInputElm, chatSendMsgElm, loadingElm, mapSelectedElm, modifyPlayerPowerups, playerListElm, powerupsDOM, powerupsMainDOM, removePlayerFromList, roomStatusElm, selectBlackElm, selectColorsElm, selectGreenElm, selectMapElm, selectOrangeElm, selectSpectatorElm, selectWhiteElm, startButtonElm } from "./page";
import { bombs, coords, flames, map, myColor, ranking, roomName, setEndScreen, setGameTime, setMapName, setMyColor, setRoomStatus, setSpeed, setSwitchedKeys, shields, switchedKeys, userName } from "./game-variables";

const protocol: 'http' | 'https' = (
   window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.0.')
   ? 'http'
   : 'https'
);

const port: number = 22822;

export const socket = io(`${protocol}://${window.location.hostname}:${port}?userName=${encodeURIComponent(userName)}&roomName=${encodeURIComponent(roomName)}`);

// set button actions
selectWhiteElm.addEventListener('click', () => socket.emit('selectColor', 'white'));
selectBlackElm.addEventListener('click', () => socket.emit('selectColor', 'black'));
selectOrangeElm.addEventListener('click', () => socket.emit('selectColor', 'orange'));
selectGreenElm.addEventListener('click', () => socket.emit('selectColor', 'green'));
selectSpectatorElm.addEventListener('click', () => socket.emit('selectColor', null));
startButtonElm.addEventListener('click', () => {
   if (userName === 'testmap:)') {
      socket.emit('tryStart', 'testmap:)');
   } else {
      socket.emit('tryStart', mapSelectedElm.value);
   }
});
chatSendMsgElm.addEventListener('click', () => {
   socket.emit('chat', chatInputElm.value);
   chatInputElm.value = '';
});


// debug socket
// (socket as any).onAny((event: any, ...args: any) => {
//    if (event !== 'C' && event !== 'gameTime') {
//       console.log(event, ...args);
//    }
// });


socket.on('initial_info', (
         players: { name: string, color: Color, isOwner: boolean }[],
         newMapName: Map,
         newMap: Block[][] | null,
         playersAlive: Color[],
         playersPowerups: { color: Color, powerup: string, value: string }[]
      ) => {
   loadingElm.hidden = true;
   if (newMap?.length) {
      for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
         for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
            map[y][x] = newMap[y][x];
         }
      }
   }

   if (newMapName as string === 'testmap:)') {
      newMapName = Map.BRICKTOWN;
   }
   setMapName(newMapName);
   
   players.forEach( ({ name, color, isOwner }) => {
      addPlayerToList(name, color, isOwner);
   });
   
   ALL_COLORS.forEach(color => {
      coords[color].alive = false;
      powerupsDOM[color].main.style.display = 'none';
   });
   playersAlive.forEach(color => {
      coords[color].alive = true;
      powerupsDOM[color].main.style.display = 'flex';
   });

   playersPowerups.forEach(powerup => {
      modifyPlayerPowerups(powerup.color, powerup.powerup, powerup.value);
   })

   window.requestAnimationFrame(gameLoop); // start the game loop
});

socket.on('player+', (username: string, color: Color, isOwner: boolean) => {
   addPlayerToList(username, color, isOwner);
})

socket.on('player-', (username: string) => {
   removePlayerFromList(username);
})

socket.on('player~', (oldUsername: string, newUsername: string, color: Color, isOwner: boolean) => {
   changePlayerFromList(oldUsername, newUsername, color, isOwner);
})


socket.on('room_status', (msg: RoomStatus) => {
   roomStatusElm.innerText = 'room status: ' + msg;
   setRoomStatus(msg);

   switch (msg) {
      case RoomStatus.WAITING:
         powerupsMainDOM.hidden = true;
         selectColorsElm.hidden = false;
         selectMapElm.hidden = false;
         break;
      case RoomStatus.STARTING:
         powerupsMainDOM.hidden = false;
         selectColorsElm.hidden = true;
         selectMapElm.hidden = true;
         canvasElm.hidden = false;
         break;
      case RoomStatus.RUNNING:
         powerupsMainDOM.hidden = false;
         selectColorsElm.hidden = true;
         selectMapElm.hidden = true;
         canvasElm.hidden = false;
         setEndScreen(null);
         break;
   }
})


socket.on('powerup-update', (statuss: { color: Color, powerup: string, value: string }[]) => {
   statuss.forEach((status) => {
      modifyPlayerPowerups(status.color, status.powerup, status.value);
   });
});


socket.on('speedUpdate', (newSpeed: number) => {
   setSpeed(newSpeed);
})


socket.on('switchKeys', () => {
   setSwitchedKeys(switchedKeys + 1);
   if (switchedKeys === 1) {
      document.dispatchEvent(new CustomEvent('switchkeyschange'));
   }

   setTimeout(() => {
      setSwitchedKeys(switchedKeys - 1);
      if (switchedKeys === 0) {
         document.dispatchEvent(new CustomEvent('switchkeyschange'));
      }
   }, 10000);
})


socket.on('shield', (color: Color, value: boolean) => {
   shields[color] = value;
})


socket.on('death', (color: Color) => {
   if (myColor === color) {
      setMyColor(null);
   }
   coords[color].alive = false;
   powerupsDOM[color].main.style.display = 'none';
})

socket.on('playersAlive', (playersAlive: Color[]) => {
   ALL_COLORS.forEach(color => {
      coords[color].alive = false;
      powerupsDOM[color].main.style.display = 'none';
   });

   playersAlive.forEach(color => {
      coords[color].alive = true;
      const playersElm = playerListElm.children;
      for (let i = 0; i < playersElm.length; ++i) {
         const playerElm = playersElm[i];
         if (!(playerElm instanceof HTMLLIElement)) {
            continue;
         }
         if (playerElm.dataset.username === userName && playerElm.style.backgroundColor === color) {
            setMyColor(color);
         }
      }
      powerupsDOM[color].main.style.display = 'flex';
      powerupsDOM[color]['bomblength'].querySelector('span')!.innerText = '2';
      powerupsDOM[color]['bombtime'].querySelector('span')!.innerText = '4s';
      powerupsDOM[color]['speed'].querySelector('span')!.innerText = 'LOW';
      powerupsDOM[color]['kickbomb'].style.visibility = 'hidden';
      powerupsDOM[color]['bomb1'].style.visibility = 'visible';
      powerupsDOM[color]['bomb2'].style.visibility = 'hidden';
      powerupsDOM[color]['bomb3'].style.visibility = 'hidden';
      powerupsDOM[color]['bomb4'].style.visibility = 'hidden';
   });
});


// these are coords received on every server tick.
// ignores the coords for myColor.
socket.on('C', (coordsReceived: [number, number, Animation][]) => {
   ALL_COLORS.forEach((color, idx) => {
      if (color === myColor) {
         return;
      }
      let animState = coordsReceived[idx][2];

      if (playerAnimations.states[color] !== animState) {
         changeAnimation(color, animState);
      }

      coords[color].x = coordsReceived[idx][0];
      coords[color].y = coordsReceived[idx][1];
   });
})

// this event updates the coords, no matter what.
// it doesn't check myColor.
socket.on('coords', (color: Color, newCoords: Coord, animState: Animation) => {
   coords[color].x = newCoords.x;
   coords[color].y = newCoords.y;
   if (animState) {
      changeAnimation(color, animState);
   }
})


socket.on('mapName', (newMapName: Map) => {
   if (newMapName as string === 'testmap:)') {
      newMapName = Map.BRICKTOWN;
   }
   setMapName(newMapName);
});

socket.on('mapUpdates', (updates: { x: number, y: number, block: Block }[]) => {
   updates.forEach(({ x, y, block }) => {
      map[y][x] = block;
   });
});

socket.on('addBomb', (bombId: number, x: number, y: number) => {
   bombs.push({ x, y, id: bombId });
});
socket.on('deleteBomb', (bombId: number) => {
   const index = bombs.findIndex(bomb => bomb.id === bombId);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
});
socket.on('updateBomb', (bombId: number, x: number, y: number) => {
   const index = bombs.findIndex(bomb => bomb.id === bombId);
   if (index !== -1) {
      bombs.splice(index, 1);
   }
   bombs.push({ x, y, id: bombId });
});

socket.on('addBombfire', (x: number, y: number) => {
   flames.push({ x: x, y: y, id: -6969 });
});
socket.on('deleteBombfire', (x: number, y: number) => {
   const index = flames.findIndex(flame => flame.x === x && flame.y === y);
   if (index !== -1) {
      flames.splice(index, 1);
   }
});


socket.on('gameTime', (time: number) => {
   setGameTime(time);
})

let menu_soundId: any = undefined;

socket.on('playsound', (soundName: string) => {
   const id = audio.play(soundName);

   if (soundName === 'draw' || soundName.startsWith('draw_') ||
         soundName === 'win' || soundName.startsWith('win_')) {
      audio.on('end', () => {
         if (menu_soundId) {
            audio.stop(menu_soundId);
         }
         menu_soundId = audio.play('menu');
         audio.loop(true, menu_soundId);
      }, id);
   }

   if (soundName === 'menu') {
      if (menu_soundId) {
         audio.stop(menu_soundId);
      }
      menu_soundId = id;
      audio.loop(true, menu_soundId);
   }
})

socket.on('stopmenusound', () => {
   if (menu_soundId) {
      audio.stop(menu_soundId);
      menu_soundId = undefined;
   }
});

socket.on('endscreen', (color: Color, newRanking: { name: string, wins: number, kills: number }[]) => {
   canvasElm.hidden = false;
   if (!color) {
      addLog('Draw! Press \'Start game\' to play again.');
   } else {
      addLog(`${color.slice(0, 1).toUpperCase() + color.slice(1)} won! Press \'Start game\' to play again.`);
   }

   if (color === null) {
      setEndScreen('draw');
   } else {
      setEndScreen(color);
   }
   
   ranking.length = 0;
   newRanking.forEach(elm => {
      ranking.push(elm);
   });
})


socket.on('chat', (username: string, msg: string) => {
   addChatMessage(username, msg);
});


socket.on('error', (msg: string) => {
   addLog(`ERROR: ${msg}`);
   console.error(`ERROR: ${msg}`);
})