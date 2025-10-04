import { WebSocket } from "ws";
import { BLOCK_SAFE_PX, BLOCK_SIZE } from "../game-consts";
import { Block, Color } from "../game-types";

const BLK = BLOCK_SIZE;
const BLK_SAFE = BLOCK_SAFE_PX;

export function tie_isDying(sok: WebSocket): void {
   // return FALSE or an array of 'colors' (who assisted to the kill)
   sok.isDying = (): boolean | Color[] => {
      if (sok.shield) {
         return false;
      }
      
      const x = sok.coords.x;
      const y = sok.coords.y;
      
      let deadBlk1: { x: number, y: number } | null = null;
      let deadBlk2: { x: number, y: number } | null = null;

      if (x % BLK === 0 && y % BLK === 0) {
         deadBlk1 = {x: x / BLK, y: y / BLK}
      }
      else if (x % BLK === 0) {
         const mod = y % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK)}
            else
               deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         } else {
            deadBlk1 = {x: x / BLK, y: Math.floor(y / BLK)}
            deadBlk2 = {x: x / BLK, y: Math.floor(y / BLK) + 1}
         }
      } else if (y % BLK === 0) {
         const mod = x % BLK
         
         if (mod > BLK - BLK_SAFE || mod < BLK_SAFE) {
            if (mod < BLK_SAFE)
               deadBlk1 = {x: Math.floor(x / BLK), y: y / BLK}
            else
               deadBlk1 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         } else {
            deadBlk1 = {x: Math.floor(x / BLK), y: y / BLK}
            deadBlk2 = {x: Math.floor(x / BLK) + 1, y: y / BLK}
         }
      } else {
         return false;  // he's messing with the coords =[
      }

      if (deadBlk1 !== null && sok.room.grid[deadBlk1.x][deadBlk1.y] === Block.PERMANENT) {
         return [];
      }
      if (deadBlk2 !== null && sok.room.grid[deadBlk2.x][deadBlk2.y] === Block.PERMANENT) {
         return [];
      }
      
      const assistColors: Color[] = [];
      Object.values(Color).forEach(assistColor => {
         if (sok.room[assistColor] === null) {
            return;
         }
         let assisted = false;
         if (deadBlk1 !== null && sok.room.getFlame(deadBlk1.x, deadBlk1.y, sok.room[assistColor])) {
            assisted = true;
         }
         if (deadBlk2 !== null && sok.room.getFlame(deadBlk2.x, deadBlk2.y, sok.room[assistColor])) {
            assisted = true;
         }

         if (assisted) {
            assistColors.push(assistColor);
         }
      });
      
      if (assistColors.length === 0) {
         return false;
      }
      return assistColors;
   }
};