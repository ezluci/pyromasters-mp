'use strict';

module.exports = (io, sok) => {
   sok.getRoomStatus = () => {
      return sok.room.status;
   }
   sok.setRoomStatus = (status) => {
      io.to(sok.roomname).emit('room_status', status);
      sok.room.status = status;
   }
};