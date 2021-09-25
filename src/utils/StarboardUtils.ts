import {
    MessageEmbed,
    MessageReaction,
    NewsChannel,
    Snowflake,
    TextChannel,
    ThreadChannel,
} from 'discord.js';
import Database from '../database/DatabaseObject';
import { GuildConfigInstance } from '../interfaces/GuildConfig';

const STARBOARD_EMBED_COLOR: readonly [number, number, number] = [255, 172, 51];
const DEFAULT_STARBOARD_EMOJI: string = '⭐';
type StarrableChannel = TextChannel | NewsChannel | ThreadChannel;

export async function findStarboardChannelForTextChannel(
    config: GuildConfigInstance,
    channel: StarrableChannel,
    database: Database
): Promise<Snowflake | null> {
    const customChannel = await database.getCustomChannel(channel.id);
    if (customChannel) {
        return customChannel.starboardId;
    }
    if (channel instanceof ThreadChannel) {
        if (channel.parent) {
            return channel.parent.nsfw
                ? config.nsfwChannelId
                : config.sfwChannelId;
        }
        return config.sfwChannelId;
    }
    return channel.nsfw ? config.nsfwChannelId : config.sfwChannelId;
}

export async function generateStarboardEmbed(
    reaction: MessageReaction
): Promise<MessageEmbed> {
    const message = await reaction.message.fetch();
    let embed = new MessageEmbed()
        .setTitle('content')
        .setDescription(message.content)
        .setColor(STARBOARD_EMBED_COLOR)
        .setTimestamp(message.createdTimestamp)
        .setAuthor(
            'Starred Message',
            message.author.displayAvatarURL({ dynamic: true })
        )
        .addFields(
            { name: 'Author', value: message.author.toString(), inline: true },
            {
                name: 'Channel',
                value: message.channel.toString(),
                inline: true,
            },
            {
                name: 'Jump To Message',
                value: `[Click Me!](${message.url})`,
                inline: false,
            }
        );
    if (!reaction.emoji.id) {
        embed.setFooter(
            ` ${reaction.emoji.name} ${reaction.count} ${
                reaction.emoji.name === DEFAULT_STARBOARD_EMOJI ? 'stars' : ''
            }`
        );
    } else if (reaction.emoji.name && reaction.emoji.url) {
        embed.setFooter(
            `${reaction.count} ${reaction.emoji.name.toLowerCase()}`,
            reaction.emoji.url
        );
    }
    const firstAttachment = message.attachments.first();
    if (firstAttachment) {
        embed.setImage(firstAttachment.url);
    }
    return embed;
}
