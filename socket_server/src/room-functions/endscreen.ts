import { Color, RoomStatus } from '../game-types';
import { Room } from '../room';
import { OutPackets } from '../out-packets/out-packets';
import { WebSocket } from 'ws';
import { logger } from '../log';
import { MatchEvent_finish } from '../match-event/finish';
import { dbInsertMatch, dbUpdateUserStats } from '../db/match';
import { MatchEvent_startGame } from '../match-event/start-game';
import { MatchMetadata } from '../db/types';

export function generate_showEndScreen(room: Room): () => void {
  return () => {
    if (room.countPlayersAlive >= 2) {
      logger.error('showEndScreen ignored');
      return;
    }

    room.ticks.endTickLoop();

    let winnerColor: Color | null = null;
    let winner: WebSocket | null = null;

    for (const color of Object.values(Color)) {
      const player = room[color];
      if (player && !player.dead) {
        winnerColor = color;
        winner = player;
      }
    }

    room.matchEvents.push(new MatchEvent_finish(room.ticks.tick));

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

    // save match to db and cleanup matchEvents
    const startGameEvent =
      room.matchEvents.length > 0 &&
      room.matchEvents[0].eventName === 'startGame'
        ? (room.matchEvents[0] as MatchEvent_startGame)
        : null;

    let metadata: MatchMetadata;
    if (startGameEvent) {
      metadata = {
        ownerId: startGameEvent.playerId,
        map: startGameEvent.map,
        playersByColors: startGameEvent.playersByColors,
        winnerId: winner ? winner.id : null,
      };
    } else {
      metadata = {
        winnerId: winner ? winner.id : null,
      };
    }

    const matchEvents = room.matchEvents;
    room.matchEvents = [];

    dbInsertMatch(room.matchStartTime, metadata, matchEvents)
      .then(() => {
        return dbUpdateUserStats(metadata, matchEvents);
      })
      .catch((err) =>
        logger.error(
          'cant save match / user stats into db: ',
          err,
          metadata,
          room.matchEvents,
        ),
      );
  };
}
