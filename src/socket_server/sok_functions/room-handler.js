'use strict';

const CONST = require('../consts');

module.exports = (io, sok) => {
   sok.getRoomStatus = () => {
      return sok.room.status;
   }
   sok.setRoomStatus = (status) => {
      io.to(sok.roomname).emit('room_status', status);
      sok.room.status = status;
   }

   sok.getMapName = () => {
      return sok.room.mapName;
   }
   sok.setMapName = (mapName) => {
      sok.room.mapName = mapName;
      io.to(sok.roomname).emit('mapName', mapName);
   }

   sok.getMap = () => {
      return sok.room.map;
   }
   sok.setMap = (map) => { // null means empty map
      sok.room.map = [];
      const updates = [];
      for (let i = 0; i < CONST.BLOCKS_VERTICALLY; i += 1) {
         sok.room.map[i] = [];
         for (let j = 0; j < CONST.BLOCKS_HORIZONTALLY; j += 1) {
            sok.room.map[i][j] = (map?.[i]?.[j] !== undefined ? map[i][j] : CONST.BLOCK.NO);
            updates.push({ x: j, y: i, block: sok.room.map[i][j], details: {} });
         }
      }

      io.to(sok.roomname).emit('mapUpdates', updates);
   }
};