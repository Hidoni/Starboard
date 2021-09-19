import { Logger } from 'log4js';
import { BitFieldResolvable, IntentsString } from 'discord.js';

export interface BotConfig {
    intents: BitFieldResolvable<IntentsString, number>;
    token: string;
    appId: string;
    debugGuildId?: string;
    commandsFolder?: string;
    eventsFolder?: string;
}
