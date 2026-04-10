import { ResultSetHeader } from 'mysql2';
import pool from './db';
import { logger } from '../log';
import { MatchMetadata } from './types';
import { MatchEvent } from '../match-event/event';
import { MatchEvent_death } from '../match-event/death';
import { MatchEvent_placeBomb } from '../match-event/place-bomb';

export async function dbInsertMatch(
  startTime: number,
  metadata: MatchMetadata,
  events: MatchEvent[],
): Promise<number> {
  const sql = `insert into matches(start_time, metadata, events_json) values (?, ?, ?)`;

  try {
    const [result] = await pool.execute<ResultSetHeader>(sql, [
      startTime,
      JSON.stringify(metadata),
      JSON.stringify(events),
    ]);

    return result.insertId;
  } catch (err) {
    logger.alert('error inserting the match', err);
    throw err;
  }
}

export async function dbUpdateUserStats(
  metadata: MatchMetadata,
  events: MatchEvent[],
) {
  const users: number[] = [];
  const usersDead: number[] = [];
  const usersKills: Map<number, number> = new Map();
  const usersBombsPlaced: Map<number, number> = new Map();

  if ('ownerId' in metadata) {
    metadata.playersByColors.forEach(({ playerId }) => {
      users.push(playerId);
    });
  }

  for (const event of events) {
    switch (event.eventName) {
      case 'startGame': {
        // const startGameEvent = event as MatchEvent_startGame;
        break;
      }
      case 'death': {
        const deathEvent = event as MatchEvent_death;
        usersDead.push(deathEvent.playerId);

        for (const assistId of deathEvent.assists) {
          if (assistId !== deathEvent.playerId) {
            usersKills.set(assistId, 1 + (usersKills.get(assistId) || 0));
          }
        }
        break;
      }
      case 'finish': {
        // const finishEvent = event as MatchEvent_finish;
        break;
      }
      case 'placeBomb': {
        const placeBombEvent = event as MatchEvent_placeBomb;
        const id = placeBombEvent.playerId;
        usersBombsPlaced.set(id, 1 + (usersBombsPlaced.get(id) || 0));
        break;
      }
      default: {
        logger.error('unhandled event in dbUpdateUserStats', event.eventName);
        break;
      }
    }
  }

  const tasks: Promise<void>[] = [];
  if (metadata.winnerId) {
    // if it's not a draw
    tasks.push(dbIncrementUserWins(metadata.winnerId));
  }

  // tasks.push(dbIncrementUsersDeaths(usersDead));
  tasks.push(dbIncrementUsersGamesPlayed(users));

  for (const [id, kills] of usersKills) {
    tasks.push(dbIncreaseUserKills(id, kills));
  }

  for (const [id, bombsPlaced] of usersBombsPlaced) {
    tasks.push(dbIncreaseUserBombsPlaced(id, bombsPlaced));
  }

  await Promise.all(tasks);
}

export async function dbIncrementUserWins(id: number): Promise<void> {
  const sql = `update users set wins = wins + 1 where id = ?`;

  try {
    await pool.execute(sql, [id]);
  } catch (err) {
    logger.error(`cant increment wins for ${id}`, err);
    throw err;
  }
}

async function dbIncreaseUserKills(id: number, amount: number): Promise<void> {
  const sql = `update users set kills = kills + ? where id = ?`;

  try {
    await pool.execute(sql, [amount, id]);
  } catch (err) {
    logger.error(`cant increase kills for ${id} ${amount}`, err);
    throw err;
  }
}

async function dbIncreaseUserBombsPlaced(
  id: number,
  amount: number,
): Promise<void> {
  const sql = `update users set bombs_placed = bombs_placed + ? where id = ?`;
  try {
    await pool.execute(sql, [amount, id]);
  } catch (err) {
    logger.error(`cant increment wins for ${id}, ${amount}`, err);
    throw err;
  }
}

async function dbIncrementUsersGamesPlayed(ids: number[]): Promise<void> {
  if (ids.length === 0) {
    return;
  }

  const placeholders = ids.map(() => '?').join(',');
  const sql = `update users set games_played = games_played + 1 where id in (${placeholders})`;

  try {
    await pool.execute(sql, ids);
  } catch (err) {
    logger.error(`cant increment games_played for ${ids}. sql: ${sql}.`, err);
    throw err;
  }
}
