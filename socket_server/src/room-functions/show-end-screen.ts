import { Color, RoomStatus } from "../game-types";
import { Room } from "../room";
import { OutPackets } from "../out-packets/out-packets";
import { WebSocket } from "ws";
import { logger } from "../log";

export function generate_showEndScreen(room: Room): () => void {
   return () => {
      if (room.countPlayersAlive >= 2) {
         logger.error('showEndScreen ignored');
         return;
      }
      
      room.ticks.endTickLoop();
      
      let winnerColor: Color | null = null;
      let winner: WebSocket | null = null;
      
      (Object.values(Color) as Color[]).forEach(color => {
         const player = room[color];
         if (player && !player.dead) {
            winnerColor = color;
            winner = player;
         }
      });

      // if (winner) {
      //    (winner as WebSocket).wins ++; // tf do you want
      // }

      // const ranking: { name: string, wins: number, kills: number }[] = [];
      // ALL_COLORS.forEach((color) => {
      //    if (room[color]) {
      //       ranking.push({ name: room[color].name, wins: room[color].wins, kills: room[color].kills });
      //    }
      // });
      
      // todo send ranking  !!!

      OutPackets.send_endScreen(room, winnerColor);
      OutPackets.send_playSound(room, winner ? 'win' : 'draw');
      room.status = RoomStatus.WAITING;
      OutPackets.send_roomStatus(room, RoomStatus.WAITING);
      room.map = null;
   };
}