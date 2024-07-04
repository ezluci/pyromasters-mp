'use strict';

module.exports = (io, sok) => {
   sok.detailsOkCheck = () => {
      if (!sok.username) {
         sok.emit('error', 'Server does not have socket details (username, room, etc.). Probably playerJoined was never emitted. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!sok.room) {
         sok.emit('error', 'Room doesn\'t exist anymore. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      if (!sok.room.players.get(sok.username)) {
         sok.emit('error', 'Player is not connected to this room. Refresh the page. DISCONNECTED.');
         sok.disconnect();
         return false;
      }
      return true;
   }
};