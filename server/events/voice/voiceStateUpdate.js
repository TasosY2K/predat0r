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

module.exports = async (client, oldMember, newMember) => {
    /**
    The type of voice update recieved by the bot.
  */

    let type;

    /**
    if the member was not in a voice channel before joining
  */

    if (!oldMember.voiceChannel) {
        type = "join";
    }

    if (oldMember.voiceChannel && !newMember.voiceChannel) {
        type = "leave";
    }

    if (newMember.voiceChannel && oldMember.voiceChannel) {
        type = "switch";
    }

    /**
    Switch through the type of the voice state.
  */

    switch (type) {
        case "switch":
            client.logger.log(
                `user ${newMember.user.username} switched voice channels: ${oldMember.voiceChannel.name} => ${newMember.voiceChannel.name}`
            );

            break;

        case "join":
            client.logger.log(
                `user ${newMember.user.username} joined voice channel: ${newMember.voiceChannel.name}`
            );

            break;

        case "leave":
            client.logger.log(
                `user ${newMember.user.username} left voice channel: ${oldMember.voiceChannel.name}`
            );
            break;

        default:
    }
};
