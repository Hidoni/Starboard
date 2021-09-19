import { Bot } from '../client/Client';
import { Handler } from './Handler';

export interface EventHandler {
    (client: Bot, ...args: any[]): Promise<void>;
}

export interface Event extends Handler {
    once: boolean;
    handler: EventHandler;
}
