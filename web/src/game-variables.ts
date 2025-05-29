import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import { Block, Bomb, Color, Map, RoomStatus } from "./game-types";

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

export let mapName: Map | null = null;
export function setMapName(newValue: Map | null) {
   mapName = newValue;
}

export let myColor: Color | null = null;
export function setMyColor(newValue: Color | null) {
   myColor = newValue;
}

export let gameTime: number = 0;
export function setGameTime(newValue: number) {
   gameTime = newValue;
}

export let speed: number = 0;
export function setSpeed(newValue: number) {
   speed = newValue;
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

export const map: Block[][] = Array.from({ length: BLOCKS_VERTICALLY }, () => Array(BLOCKS_HORIZONTALLY).fill(Block.NO));

export const bombs: Bomb[] = [];

// counts how many flames there are in a spot
export const flames: number[][] = Array.from({ length: BLOCKS_VERTICALLY }, () => Array(BLOCKS_HORIZONTALLY).fill(0));

export const shields = Object.fromEntries(
   Object.values(Color).map(color => [
      color,
      false
   ])
) as {
   [C in Color]: boolean
};

export const coords = Object.fromEntries(
   Object.values(Color).map(color => [
      color,
      { x: 0, y: 0, alive: false }
   ])
) as {
   [C in Color]: {
      x: number,
      y: number,
      alive: boolean
   }
};