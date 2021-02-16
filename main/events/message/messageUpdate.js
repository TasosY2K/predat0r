module.exports = async (client, oldMessage, newMessage) => {
  const message = newMessage;
  const expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  if (message.content.match(expression) || message.content.replace(/\s/g, '').match(expression)) {
    // message.delete();
    console.log(`[LINK] a link was sent in ${message.channel.id}`);
  }
};

