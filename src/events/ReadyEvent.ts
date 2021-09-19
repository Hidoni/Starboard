import { Bot } from '../client/Client';
import { EventHandler } from '../interfaces/Event';

export const name: string = 'ready';
export const handler: EventHandler = async (client: Bot) =>
    client.logger?.info(`Logged in as ${client.user?.tag}`);
export const once: boolean = true;
