function chat(msg, io, ROOMS, sok) {
   if (!sok.detailsOkCheck())
      return;

   if (msg === '') {
      return;
   }

   io.to(sok.room).emit('chat', sok.username, msg);
}

module.exports.chat = chat;