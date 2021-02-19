exports.run = (client, message) => {
    message.channel.send(
        `pong! that took ${Math.round(client.ws.ping)}ms to ping to discord.`
    );
};
