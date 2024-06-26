'use strict';

function chat(msg, io, sok) {
   if (!sok.detailsOkCheck())
      return;

   if (msg === '') {
      return;
   }

   io.to(sok.roomname).emit('chat', sok.username, msg);
}

module.exports.chat = chat;