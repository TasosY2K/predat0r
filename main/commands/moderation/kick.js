exports.run = function(client, message, [...reason]) {
  if (message.member.permissions.has('KICK_MEMBERS', true)) {
    const joinedReason = reason.length > 0 ? reason.join(' ') : 'Not Specified.';
    if (message.mentions.members.size == 0) {
      return message.channel.send(`> :no_entry_sign: You need to mention whom to kick.`);
    } else {
      // Check if the moderator wants the kick to be silent.
      if (joinedReason.includes('-s')) {
        message.delete();
        if (message.mentions.members.first().kickable) {
          message.mentions.members.first().kick(`Kicked by: ${message.author.id}, for the reason: ${joinedReason}`);
          return message.author.send(`> :ballot_box_with_check: Silently kicked ${message.mentions.members.first().user.tag}`).catch((ignore) => {
            return message.channel.send(`> :no_pedestrians: Done!`).then((m) => m.delete(3000));
          });
        } else {
          return message.channel.send(`> :no_entry_sign: I cannot kick this user.`).then((m) => m.delete(3000));
        }
      } else {
        if (message.mentions.members.first().kickable) {
          message.mentions.members.first().send(`You have been kicked from **${message.guild.name}**, for the reason:\n **${joinedReason}**.`).catch((ignore) => {});
          message.mentions.members.first().kick(`Kicked by: ${message.author.id}, reason: ${joinedReason}`);
          return message.channel.send(`> :no_pedestrians: Successfuly kicked ${message.mentions.members.first().user.tag}`);
        } else {
          return message.channel.send(`> :no_entry_sign: I cannot kick this user.`);
        }
      }
    }
  } else {
    return message.channel.send(`> :no_entry_sign: You require to have the \`KICK_MEMBERS\` permission node in order to kick others.`);
  }
};
