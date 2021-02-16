const {Client, Collection} = require('discord.js');
const panel = require('./panel/panel.js');
const filewalker = require('./library/walk.js');
const path = require('path');
const filesystem = require('fs');
const dotenv = require('dotenv');

dotenv.config();

async function init(settings = {
  token: process.env.BOT_TOKEN,
  fallbackPrefix: '>>', // the prefix to use if the guild has not defined their own. (a.k.a the default prefix.)
  blacklistedUsers: [],
  blacklistedGuilds: [],
  sharding: false, // only set this to true when the bot hits 1000 Guilds.
}) {
  const client = new Client();
  client.commands = new Collection();
  client.settings = settings;
  client.logger = require('./library/logger.js');

  const commands = await filewalker.walk(`${__dirname}/commands/`);
  const events = await filewalker.walk(`${__dirname}/events/`);

  events.forEach((event) => {
    const time = new Date().getMilliseconds();
    client.on(event.name.split('.')[0], require(event.path).bind(null, client));
    console.log(`[EVENT] loaded event ${event.name} in ${new Date().getMilliseconds() - time}ms`);
  });

  commands.forEach((command) => {
    const time = new Date().getMilliseconds();
    client.commands.set(command.name.split('.')[0], require(command.path));
    console.log(`[COMMAND] loaded command ${command.name} in ${new Date().getMilliseconds() - time}ms`);
  });

  await panel.init(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
  await client.login(settings.token);
}

init();
