import { Message, Snowflake, TextChannel } from 'discord.js';
import Database from '../database/DatabaseObject';
import { GuildConfigInstance } from '../interfaces/GuildConfig';

async function findStarboardChannelForTextChannel(config: GuildConfigInstance, channel: TextChannel, database: Database): Promise<Snowflake> {
    const customChannel = await database.getCustomChannel(channel.id);
    if (customChannel) {
        return customChannel.starboardId;
    }
    return channel.nsfw ? config.nsfwChannelId : config.sfwChannelId;
}
