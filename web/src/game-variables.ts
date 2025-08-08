import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { Block, Bomb, Color, Map, Player, RoomStatus } from "./game-types";
import { DOM_addPlayer, DOM_changePlayerColor, DOM_removePlayer } from "./page";

const queryParams = new URLSearchParams(window.location.search);

if (!queryParams.get('username') || !queryParams.get('room')) {
   throw new Error("Missing query params 'username' or 'room'.");
}

export const userName = queryParams.get('username')!;
export const roomName = queryParams.get('room')!;

export let deltaTime: number;
export function setDeltaTime(newValue: number) {
   deltaTime = newValue;
}

export let map: Map | null = null;
export function setMap(newValue: Map | null) {
   map = newValue;
}

export let myPlayer: Player;
export function setMyPlayer(newValue: Player) {
   myPlayer = newValue;
}

export let gameTime: number = 0;
export function setGameTime(newValue: number) {
   gameTime = newValue;
}

export let switchedKeys: number = 0;
export function setSwitchedKeys(newValue: number) {
   switchedKeys = newValue;
}

export let roomStatus: RoomStatus = RoomStatus.WAITING;
export function setRoomStatus(newValue: RoomStatus) {
   roomStatus = newValue;
}

export let endScreen: Color | 'draw' | null = null;
export function setEndScreen(newEndScreen: Color | 'draw' | null) {
   endScreen = newEndScreen;
}

export const ranking: { name: string, wins: number, kills: number }[] = [];

export const grid: Block[][] = Array.from({ length: BLOCKS_VERTICALLY }, () => Array(BLOCKS_HORIZONTALLY).fill(Block.NO));

export const bombs: Bomb[] = [];

// counts how many flames there are in a spot
export const flames: number[][] = Array.from({ length: BLOCKS_VERTICALLY }, () => Array(BLOCKS_HORIZONTALLY).fill(0));

export const players: globalThis.Map<string, Player> = new globalThis.Map();

export const colors: { [C in Color]: Player | null } = {
   white: null,
   black: null,
   orange: null,
   green: null
};
(window as any).colors = colors;

export function addPlayer(userName: string) {
   DOM_addPlayer(userName);
   const player = new Player(userName);
   players.set(userName, player);
}

export function removePlayer(userName: string) {
   DOM_removePlayer(userName);
   players.delete(userName);
}

export function changePlayerColor(playerUserName: string, newColor: Color | null) {
   DOM_changePlayerColor(playerUserName, newColor);

   const player = players.get(playerUserName);
   if (!player) {
      return console.error('changePlayerColor: playerUserName not found');
   }

   if (player.color) {
      colors[player.color] = null;
   }
   player.color = newColor;
   if (player.color) {
      colors[player.color] = player;
   }
}