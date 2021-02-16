const path = require('path')
const { Client, Collection } = require('discord.js')
const dotenv = require('dotenv')

const filewalker = require('./library/walk.js')
const socketInterface = require('./rest/interface.js')

dotenv.config()

const init = async (settings = {
  token: process.env.BOT_TOKEN,
  fallbackPrefix: '>>', // the prefix to use if the guild has not defined their own. (a.k.a the default prefix.)
  blacklistedUsers: [],
  blacklistedGuilds: [],
  sharding: false // only set this to true when the bot hits 1000 Guilds.
}) => {
  const bot = new Client()
  bot.commands = new Collection()
  bot.settings = settings
  bot.logger = require('./library/logger.js')

  const commands = await filewalker.walk(path.join(__dirname, './commands'))
  const events = await filewalker.walk(path.join(__dirname, './events'))

  events.forEach((event) => {
    const time = new Date().getMilliseconds()
    bot.on(event.name.split('.')[0], require(event.path).bind(null, bot))
    console.log(`[EVENT] loaded event ${event.name} in ${new Date().getMilliseconds() - time}ms`)
  })

  commands.forEach((command) => {
    const time = new Date().getMilliseconds()
    bot.commands.set(command.name.split('.')[0], require(command.path))
    console.log(`[COMMAND] loaded command ${command.name} in ${new Date().getMilliseconds() - time}ms`)
  })

  await socketInterface.init(bot)
  await bot.login(settings.token)
}

init()
