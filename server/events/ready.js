module.exports = (client) => {
    console.log(`[READY] ready for ${client.guilds.cache.size} guilds`);
    client.user.setActivity(`${client.settings.fallbackPrefix}help`);
};
