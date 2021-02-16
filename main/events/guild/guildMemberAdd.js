module.exports = async (client, member) => {
  client.logger.log(`User ${member.user.username} joined guild ${member.guild.name}`);
};
