import { ThreadChannel } from 'discord.js';
import { Bot } from '../client/Client';
import { EventHandler } from '../interfaces/Event';

export const name: string = 'threadCreate';
export const handler: EventHandler = async (
    client: Bot,
    thread: ThreadChannel,
) => {
    if (!thread.joined) {
        console.log(`Not in thread ${thread.name}`);
        thread
            .join()
            .catch((error) =>
                client.logger?.debug(
                    `Ignoring potential permission error while attempting to join thread in guild with ID ${thread.guildId} (error: ${error})`,
                ),
            );
    }
};
