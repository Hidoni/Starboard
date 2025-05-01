import log4js from 'log4js';
import { Bot } from './client/Client';
import path from 'path';
import Database from './database/DatabaseObject';
import { GatewayIntentBits, Partials } from 'discord.js';

log4js.configure('./config/log4js.json');
const logger = log4js.getLogger('starboard');

const REQUIRED_ENV_VARS: string[] = [
    'BOT_TOKEN',
    'BOT_APPLICATION_ID',
    'DATABASE_PATH',
    'TENOR_API_KEY'
];
for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
        logger.error(`Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const bot = new Bot(
    {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessageReactions,
        ],
        token: process.env.BOT_TOKEN!,
        appId: process.env.BOT_APPLICATION_ID!,
        database: new Database(process.env.DATABASE_PATH!, logger),
        debugGuildId: process.env.DEBUG_GUILD_ID,
        commandsFolder: path.join(__dirname, 'commands/'),
        eventsFolder: path.join(__dirname, 'events/'),
        componentHandlersFolder: path.join(__dirname, 'component_handlers/'),
        partials: [Partials.Reaction, Partials.Message],
    },
    logger,
);

logger.info('Starting bot');
bot.run();
