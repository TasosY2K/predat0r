/**
 * Copyright 2019 Abstract Development
 *
 * This file is licensed by Abstract Development;
 * you may not use this file except in compliance with the License.
 * you may obtain a copy of this lisence at
 *
 *      https://abstractbot.xyz/license
 *
 * Do not use or distribute this file without a copy of the license.
 * Refer to the license for restrictions of use.
 */

const { MessageMentions } = require("discord.js");

module.exports = async (client, message) => {
    const prefix = client.settings.fallbackPrefix;

    if (message.author.bot || message.content.indexOf(prefix) !== 0) return;

    console.log(
        `[MESSAGE] message recieved in ${message.guild} from ${message.author.id}`
    );

    const args = message.content
        .slice(prefix.length)
        .trim()
        .replace(MessageMentions.CHANNELS_PATTERN, "")
        .replace(MessageMentions.EVERYONE_PATTERN, "")
        .replace(MessageMentions.ROLES_PATTERN, "")
        .replace(MessageMentions.USERS_PATTERN, "")
        .split(/ +/g);

    const command = args.shift().toLowerCase();

    const cmd = client.commands.get(command);
    if (!cmd) return;

    cmd.run(client, message, args);
};
