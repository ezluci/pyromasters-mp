import { Socket } from "socket.io";
import { ALL_COLORS } from "../game-consts";
import { Color, RoomStatus } from "../game-types";
import { Room } from "../room";
import { playSound } from "./play-sound";

export function generate_showEndScreen(room: Room): () => void {
   const io = room.owner.nsp.server;
   return () => {
      if (room.countPlayersAlive >= 2) {
         console.error('showEndScreen ignored');
         return;
      }
      
      room.ticks.endTickLoop();
      
      let winnerColor: Color | null = null;
      let winner: Socket | null = null;
      
      for (const color of ALL_COLORS) { // typescript is complaining about foreach
         if (room[color] && !room[color].dead) {
            winnerColor = color;
            winner = room[color];
         }
      }

      if (winner) {
         winner.wins ++;
      }

      const ranking: { name: string, wins: number, kills: number }[] = [];
      ALL_COLORS.forEach((color) => {
         if (room[color]) {
            ranking.push({ name: room[color].name, wins: room[color].wins, kills: room[color].kills });
         }
      });

      io.to(room.name).emit('endscreen', winnerColor, ranking);
      playSound(room, winner ? 'win' : 'draw');
      room.status = RoomStatus.WAITING;
      room.mapName = '';
   };
}