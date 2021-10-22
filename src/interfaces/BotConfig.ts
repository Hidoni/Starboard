import { BitFieldResolvable, IntentsString, PartialTypes } from 'discord.js';
import Database from '../database/DatabaseObject';

export interface BotConfig {
    intents: BitFieldResolvable<IntentsString, number>;
    token: string;
    appId: string;
    database: Database;
    debugGuildId?: string;
    partials?: PartialTypes[];
    commandsFolder?: string;
    eventsFolder?: string;
    componentHandlersFolder?: string;
}
