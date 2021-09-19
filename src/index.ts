import * as log4js from 'log4js';
import { Intents } from 'discord.js';
import { Bot } from './client/Client';
import * as Path from 'path';

log4js.configure('./config/log4js.json');
const logger = log4js.getLogger('starboard');

const REQUIRED_ENV_VARS: string[] = ['BOT_TOKEN', 'BOT_APPLICATION_ID'];
for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const bot = new Bot(
    {
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
        token: process.env.BOT_TOKEN!,
        appId: process.env.BOT_APPLICATION_ID!,
        debugGuildId: process.env.DEBUG_GUILD_ID,
        commandsFolder: Path.join(__dirname, 'commands/'),
        eventsFolder: Path.join(__dirname, 'events/'),
    },
    logger
);

logger.info("Starting bot");
bot.run();
