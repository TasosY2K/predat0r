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

module.exports = async (client, guild) => {
    client.logger.log(`Guild ${guild.name} removed ${client.user.tag}.`);
};
