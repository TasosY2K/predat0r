/**
 * Called when a guild goes unavailable.
 */

module.exports = async (client, guild) => {
  if (client.cache.has(guild.id)) client.cache.delete(guild.id);
};
