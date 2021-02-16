exports.run = function(client, message) {
  message.channel.send(`pong! that took ${Math.round(client.ping)}ms to ping to discord.`);
};
