const log4js = require('log4js');
const { Client, Intents } = require('discord.js');
const { getRelativePathname } = require('./utils/file');

log4js.configure('./config/log4js.json');
const logger = log4js.getLogger(getRelativePathname(__filename));

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    logger.info(`Bot ready, logged in as ${client.user.username}#${client.user.discriminator}`);
});

client.login(process.env.BOT_TOKEN);
