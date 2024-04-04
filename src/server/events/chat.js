'use strict';

function chat(msg, io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;

   if (! /^[a-z 0-9]+$/i.test(msg)) {
      return;
   }

   if (msg === '') {
      return;
   }

   io.to(sok.room).emit('chat', sok.username, msg);
}

module.exports.chat = chat;