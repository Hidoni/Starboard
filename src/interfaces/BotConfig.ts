import { GatewayIntentBits, Partials } from 'discord.js';
import Database from '../database/DatabaseObject';

export interface BotConfig {
    intents: GatewayIntentBits[];
    token: string;
    appId: string;
    database: Database;
    debugGuildId?: string;
    partials?: Partials[];
    commandsFolder?: string;
    eventsFolder?: string;
    componentHandlersFolder?: string;
}
