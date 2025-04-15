import {
    ActionRowBuilder,
    APIInteractionGuildMember,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ForumChannel,
    Guild,
    GuildEmoji,
    GuildMember,
    GuildTextBasedChannel,
    MediaChannel,
    Message,
    MessageReaction,
    PermissionResolvable,
    PermissionsBitField,
    Snowflake,
    ThreadChannel,
} from 'discord.js';
import Database from '../database/DatabaseObject';
import { GuildConfigInstance } from '../interfaces/GuildConfig';
import { StarredMessageInstance } from '../interfaces/StarredMessages';

const STARBOARD_EMBED_COLOR: readonly [number, number, number] = [255, 172, 51];
const DEFAULT_STARBOARD_EMOJI: string = '⭐';
export async function findStarboardChannelForTextChannel(
    config: GuildConfigInstance,
    channel: GuildTextBasedChannel | ForumChannel | MediaChannel,
    database: Database,
): Promise<Snowflake | null> {
    const customChannel = await database.getCustomChannel(channel.id);
    if (customChannel) {
        return customChannel.starboardId;
    }
    if (channel instanceof ThreadChannel) {
        if (channel.parent) {
            return findStarboardChannelForTextChannel(
                config,
                channel.parent,
                database,
            );
        }
        return config.sfwChannelId;
    }
    return channel.nsfw
        ? config.nsfwChannelId
            ? config.nsfwChannelId
            : config.sfwChannelId
        : config.sfwChannelId;
}

export async function generateStarboardEmbed(
    reaction: MessageReaction,
): Promise<EmbedBuilder> {
    const message = await reaction.message.fetch();
    let embed = generateBasicStarboardEmbed(message);
    if (!reaction.emoji.id) {
        embed.setFooter({
            text: ` ${reaction.emoji.name} ${reaction.count} ${
                reaction.emoji.name === DEFAULT_STARBOARD_EMOJI ? 'stars' : ''
            }`,
        });
    } else if (reaction.emoji.name && reaction.emoji.url) {
        embed.setFooter({
            text: `${reaction.count} ${reaction.emoji.name.toLowerCase()}`,
            iconURL: reaction.emoji.url,
        });
    }
    return embed;
}

export function generateBasicStarboardEmbed(message: Message): EmbedBuilder {
    let embed = new EmbedBuilder()
        .setTitle('Content')
        .setDescription(message.content)
        .setColor(STARBOARD_EMBED_COLOR)
        .setTimestamp(message.createdTimestamp)
        .setAuthor({
            name: 'Starred Message',
            iconURL: message.author.displayAvatarURL(),
        })
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
            },
        );
    const firstAttachment = message.attachments.first();
    if (firstAttachment) {
        embed.setImage(firstAttachment.url);
    }
    return embed;
}

export function generateLeaderboardEmbed(
    leaderboard: StarredMessageInstance[],
    page: number,
): EmbedBuilder {
    const pageCount = Math.ceil(leaderboard.length / 10);
    if (page <= 0) {
        throw new Error('Leaderboard page number must be 1 or higher');
    } else if (page > pageCount) {
        throw new Error(
            `Leaderboard page number exceeds amount of pages (${pageCount})`,
        );
    }
    const selectedUsers = leaderboard.slice((page - 1) * 10, page * 10);
    const startIndex = (page - 1) * 10 + 1;
    const { 0: userRows, 1: starRows } = selectedUsers.reduce(
        (strings, user, index) => [
            strings[0] + `${index + startIndex}. <@${user.userId}>\n`,
            strings[1] + `${user.starCount}\n`,
        ],
        ['', ''],
    );
    return new EmbedBuilder()
        .setTitle('Leaderboards')
        .setFooter({ text: `Page ${page} out of ${pageCount}` })
        .setColor(STARBOARD_EMBED_COLOR)
        .addFields(
            {
                name: 'User',
                value: userRows,
                inline: true,
            },
            { name: 'Stars', value: starRows, inline: true },
        );
}

export function generateLeaderboardComponentsRow(
    leaderboard: StarredMessageInstance[],
    page: number,
): ActionRowBuilder<ButtonBuilder> {
    const pageCount = Math.ceil(leaderboard.length / 10);
    if (page <= 0) {
        throw new Error('Leaderboard page number must be 1 or higher');
    } else if (page > pageCount) {
        throw new Error(
            `Leaderboard page number exceeds amount of pages (${pageCount})`,
        );
    }
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setEmoji('⏮')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('leaderboard_FIRST')
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setEmoji('◀')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`leaderboard_${page - 1}`)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setEmoji('▶')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`leaderboard_${page + 1}`)
            .setDisabled(page === pageCount),
        new ButtonBuilder()
            .setEmoji('⏭')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('leaderboard_LAST')
            .setDisabled(page === pageCount),
    );
}

export function hasPermissions(
    member: GuildMember | APIInteractionGuildMember,
    permissions: PermissionResolvable,
    checkAdmin?: boolean,
): boolean {
    if (member instanceof GuildMember) {
        return member.permissions.has(permissions, checkAdmin);
    }
    const userPermissions = BigInt(member.permissions);
    return new PermissionsBitField(userPermissions).has(
        permissions,
        checkAdmin,
    );
}

export async function fetchEmoteFromGuild(
    guild: Guild,
    id: Snowflake,
): Promise<GuildEmoji | null> {
    try {
        return guild.emojis.fetch(id);
    } catch (error) {
        return null;
    }
}
