import { Bot } from '../client/Client';

export interface EventHandler {
    (client: Bot, ...args: any[]): Promise<void>;
}

export interface Event {
    name: string
    once: boolean;
    handler: EventHandler;
}
