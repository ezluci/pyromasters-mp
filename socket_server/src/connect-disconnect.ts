import { Animation, Color, RoomStatus } from "./game-types";
import { Room } from "./room";
import { WebSocket } from "ws";
import { OutPackets } from "./out-packets/out-packets";
import { BLOCKS_HORIZONTALLY, BLOCKS_VERTICALLY } from "./game-consts";
import jwt from "jsonwebtoken";
import { logger } from "./log";

export function playerConnect(
    url: string | undefined,
    rooms: Map<string, Room>,
    users: Map<number, WebSocket>,
    sok: WebSocket,
    claims: jwt.JwtPayload | undefined
): void {
  url = url?.substring(1);
  if (!url) {
    return sok.close();
  }

  const roomName = decodeURIComponent(url).toLowerCase();
  
  if (! /^[ -~]{1,15}$/.test(roomName)) {
    const msg = `invalid room name: ${roomName}`;
    logger.notice(msg);
    OutPackets.send_error(sok, msg);
    return sok.close();
  }

  sok.id = (claims ? parseInt(claims.user_id) : 0);
  sok.name = (claims ? claims.username : '');

  sok.isOwner = !rooms.has(roomName);
  sok.isGuest = (claims ? false : true);

  if (!sok.isGuest && users.get(sok.id)) {
    const msg = 'you are already in a room, try again later';
    OutPackets.send_error(sok, msg);
    return sok.close();
  }

  sok.wins = 0;
  sok.kills = 0;

  sok.color = null;
  sok.x = 0;
  sok.y = 0;
  sok.dead = false;
  sok.animState = Animation.IDLE_FRONT;

  sok.speed = 0;
  sok.bombCount = 0;
  sok.bombTime = 0;
  sok.bombLength = 0;
  
  sok.shield = false;
  sok.shieldFalse_tickId = 0;

  sok.sick = false;
  sok.sickFalse_tickId = 0;
  
  sok.kickBombs = false;

  if (sok.isGuest && sok.isOwner) {
    const msg = 'the room doesnt exist. ur not logged in so you cant create rooms. make an account to play';
    OutPackets.send_error(sok, msg);
    return sok.close();
  }

  if (sok.isOwner) {
    rooms.set(roomName, new Room(roomName, sok));
  }

  const room = rooms.get(roomName);
  if (room) {
    sok.room = room;
  }
  if (!sok.isGuest) {
    users.set(sok.id, sok);
  }

  if (!sok.isGuest) {
    logger.info(`{ id: ${sok.id}, name: ${sok.name} }   JOINS  '${sok.room.name}'`);
  } else {
    logger.info(`Guest JOINS  '${sok.room.name}'`);
  }

  // send all the existing players to the new player
  sok.room.players.forEach(player => {
    OutPackets.send_playerPlus(sok, player);
    if (player.color) {
      OutPackets.send_playerAttribute(sok, player, 'color');
    }
  });

  // add the new player to the room
  if (!sok.isGuest) {
    sok.room.players.set(sok.name, sok);
  } else {
    sok.room.guests.add(sok);
  }

  // send the new player to EVERYONE in the room
  if (!sok.isGuest) {
    OutPackets.send_playerPlus(sok.room, sok);
  }

  sok.room.players.forEach(player => {
    if (player.isOwner) {
      OutPackets.send_playerAttribute(sok, player, 'isOwner');
    }
  });
  
  if (sok.room.status !== RoomStatus.RUNNING) {
    OutPackets.send_playSound(sok, 'menu');
  }

  // send ranking here.. todo
  OutPackets.send_roomStatus(sok, sok.room.status);

  // send other information about the game
  if (sok.room.status !== RoomStatus.WAITING) {
    Object.values(Color).forEach(color => {
      if (sok.room[color]) {
        const sokFrom = sok.room[color];
        // OutPackets.send_playerAttribute(sok, sokFrom, 'wins');
        // OutPackets.send_playerAttribute(sok, sokFrom, 'kills');

        OutPackets.send_playerAttribute(sok, sokFrom, 'coords');
        OutPackets.send_playerAttribute(sok, sokFrom, 'dead');
        OutPackets.send_playerAttribute(sok, sokFrom, 'animState');

        OutPackets.send_playerAttribute(sok, sokFrom, 'speed');
        OutPackets.send_playerAttribute(sok, sokFrom, 'bombCount');
        OutPackets.send_playerAttribute(sok, sokFrom, 'bombTime');
        OutPackets.send_playerAttribute(sok, sokFrom, 'bombLength');
        OutPackets.send_playerAttribute(sok, sokFrom, 'shield');
        OutPackets.send_playerAttribute(sok, sokFrom, 'sick');
        OutPackets.send_playerAttribute(sok, sokFrom, 'kickBombs');
      }
    });

    if (sok.room.map) {
      OutPackets.send_map(sok, sok.room.map);
    }
    OutPackets.send_gameTime(sok, sok.room.gameTime);

    for (let x = 0; x < BLOCKS_HORIZONTALLY; ++x) {
      for (let y = 0; y < BLOCKS_VERTICALLY; ++y) {
        OutPackets.send_gridUpdate(sok, x, y, sok.room.grid[x][y]);
      }
    }

    sok.room.bombs.forEach(bomb => {
      OutPackets.send_addBomb(sok, bomb.x, bomb.y, bomb.id);
    });
    sok.room.flames.forEach(flame => {
      OutPackets.send_addFlame(sok, flame.x, flame.y);
    });
  }
}


export function playerDisconnect(rooms: Map<string, Room>, users: Map<number, WebSocket>, sok: WebSocket): void {
  if (!sok.room) {
    return;
  }
  const room = rooms.get(sok.room.name);
  if (!room) {
    return;
  }

  if (!sok.isGuest) {
    logger.info(`{ id: ${sok.id}, name: ${sok.name} }   LEAVES '${room.name}'`);
  } else {
    logger.info(`Guest LEAVES '${room.name}'`);
  }

  if (sok.isOwner) {
    // destroy room
    OutPackets.send_chat(room, sok, 'Owner left. Room deleted.');
    
    room.players.forEach(player => {
      if (player !== sok) {
        playerDisconnect(rooms, users, player);
      }
    });
    if (room.ticks.tickLoopIntervalId) {
      room.ticks.endTickLoop();
    }
    rooms.delete(room.name);
  } else {
    if (!sok.isGuest) {
      OutPackets.send_playerMinus(room, sok);
      if (sok.color !== null) {
        if (room.status === RoomStatus.RUNNING && !sok.dead) {
          OutPackets.send_death(room, sok.color);
          room.countPlayersAlive --;
          OutPackets.send_playSound(room, 'dead');
        }
        room[sok.color] = null;
      }
    } else {
      room.guests.delete(sok);
    }
  }

  sok.close();
  if (!sok.isGuest) {
    room.players.delete(sok.name);
    users.delete(sok.id);
  } else {
    room.guests.delete(sok);
  }
}