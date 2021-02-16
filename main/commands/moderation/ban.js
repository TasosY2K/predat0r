exports.run = function(client, message, [...reason]) {
  if (message.member.permissions.has('BAN_MEMBERS', true)) {
    const joinedReason = reason.length > 0 ? reason.join(' ') : 'Not Specified.';
    if (message.mentions.members.size == 0) {
      return message.channel.send(`> :no_entry_sign: You need to mention whom to ban.`);
    } else {
      // Check if the moderator wants the ban to be silent.
      if (joinedReason.includes('-s')) {
        message.delete();
        if (message.mentions.members.first().banable) {
          message.mentions.members.first().ban(`Banned by: ${message.author.id}, for the reason: ${joinedReason}`);
          return message.author.send(`> :ballot_box_with_check: Silently banned ${message.mentions.members.first().user.tag}`).catch((ignore) => {
            return message.channel.send(`> :hammer: Done!`).then((m) => m.delete(3000));
          });
        } else {
          return message.channel.send(`> :no_entry_sign: I cannot ban this user.`).then((m) => m.delete(3000));
        }
      } else {
        if (message.mentions.members.first().banable) {
          message.mentions.members.first().send(`You have been banned from **${message.guild.name}**, for the reason:\n **${joinedReason}**.`).catch((ignore) => {});
          message.mentions.members.first().ban(`Banned by: ${message.author.id}, reason: ${joinedReason}`);
          return message.channel.send(`> :hammer: Successfuly banned ${message.mentions.members.first().user.tag}`);
        } else {
          return message.channel.send(`> :no_entry_sign: I cannot ban this user.`);
        }
      }
    }
  } else {
    return message.channel.send(`> :no_entry_sign: You require to have the \`BAN_MEMBERS\` permission node in order to ban others.`);
  }
};
