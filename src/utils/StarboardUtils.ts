import {
    ActionRowBuilder,
    APIInteractionGuildMember,
    Attachment,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    Embed,
    EmbedBuilder,
    ForumChannel,
    Guild,
    GuildEmoji,
    GuildMember,
    GuildTextBasedChannel,
    MediaChannel,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    Message,
    MessageReaction,
    MessageSnapshot,
    PermissionResolvable,
    PermissionsBitField,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    Snowflake,
    TextDisplayBuilder,
    ThreadChannel,
    ThumbnailBuilder,
} from 'discord.js';
import Database from '../database/DatabaseObject';
import { GuildConfigInstance } from '../interfaces/GuildConfig';
import { StarredMessageInstance } from '../interfaces/StarredMessages';
import { enumerate } from './IterableUtils';
import { escapeRegex } from './RegExpUtils';
import { getTenorDataFromPostID } from './TenorUtils';
import { LRUCache } from 'lru-cache';

const STARBOARD_EMBED_COLOR: [number, number, number] = [255, 172, 51];
const DEFAULT_STARBOARD_EMOJI: string = '⭐';
const KNOWN_NO_CONTENT_EMBED_TYPES = ['gifv', 'image'];
const MESSAGE_CONTENT_MAX_LENGTH = 3000;

const ONE_DAY_IN_MS = 86400000;
const TENOR_LRU_CACHE = new LRUCache<string, string>({
    max: 1000,
    ttl: ONE_DAY_IN_MS,
    fetchMethod: async (key) => {
        const tenorData = await getTenorDataFromPostID(key, ['gif']);
        if (!tenorData.media_formats['gif']) {
            return undefined;
        }
        return tenorData.media_formats['gif'].url;
    },
});
const KNOWN_GIF_EMBED_PROVIDERS: {
    [provider: string]: (embed: Embed) => Promise<string | null>;
} = {
    Giphy: async (embed: Embed) => embed.video?.url.slice(0, -3) + 'gif',
    Tenor: async (embed: Embed) => {
        if (!embed.url) {
            return null;
        }
        const postID = embed.url.split('-').at(-1);
        if (!postID) {
            return null;
        }
        return (await TENOR_LRU_CACHE.fetch(postID)) ?? null;
    },
};

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

function getMessageSnapshot(message: Message): MessageSnapshot | undefined {
    if (message.messageSnapshots) {
        return message.messageSnapshots.first();
    }
}

function isVisualAttachment(attachment: Attachment): boolean {
    return (
        attachment.contentType != null &&
        (attachment.contentType.startsWith('image/') ||
            attachment.contentType.startsWith('video/'))
    );
}

async function createMediaGalleryFromIterable<T>(
    iterable: Iterable<T>,
    descriptionProvider: (entry: T, index: number) => string,
    urlProvider: (entry: T) => Promise<string>,
    spoilerProvider: (entry: T) => boolean,
): Promise<MediaGalleryBuilder | null> {
    let mediaGalleryBuilder = new MediaGalleryBuilder();
    for (const [index, entry] of enumerate(iterable)) {
        mediaGalleryBuilder = mediaGalleryBuilder.addItems(
            new MediaGalleryItemBuilder({
                description: descriptionProvider(entry, index),
                media: {
                    url: await urlProvider(entry),
                },
                spoiler: spoilerProvider(entry),
            }),
        );
    }
    if (mediaGalleryBuilder.items.length !== 0) {
        return mediaGalleryBuilder;
    }
    return null;
}

async function getMessageVisualAttachmentsAsComponent(
    message: Message | MessageSnapshot,
): Promise<MediaGalleryBuilder | null> {
    const visualAttachments = message.attachments.filter(isVisualAttachment);
    return createMediaGalleryFromIterable(
        visualAttachments.values(),
        (attachment, index) => {
            const baseDescription = `Starred visual message attachment number ${
                index + 1
            } of ${visualAttachments.size}`;
            return attachment.description
                ? `${baseDescription}. Original description: ${attachment.description}`
                : baseDescription;
        },
        async (attachment) => attachment.url,
        (attachment) => attachment.spoiler,
    );
}

function isEmbedKnownGifvEmbed(embed: Embed): boolean {
    return (
        Object.keys(KNOWN_GIF_EMBED_PROVIDERS).find(
            (value) => value === embed.provider?.name,
        ) != undefined
    );
}

async function getEmbedImageUrl(embed: Embed): Promise<string | null> {
    if (isEmbedKnownGifvEmbed(embed)) {
        return await KNOWN_GIF_EMBED_PROVIDERS[embed.provider!.name!](embed);
    }
    if (embed.video) {
        return embed.video.url;
    }
    if (embed.image) {
        return embed.image.url;
    }
    if (embed.thumbnail) {
        return embed.thumbnail.url;
    }
    return null;
}

function isMessageNoContentEmbed(message: Message | MessageSnapshot): boolean {
    return (
        message.embeds.length === 1 &&
        KNOWN_NO_CONTENT_EMBED_TYPES.find(
            (value) => value === message.embeds[0].data.type,
        ) !== undefined &&
        message.content == message.embeds[0].url
    );
}

function isEmbedSpoilered(
    message: Message | MessageSnapshot,
    embed: Embed,
): boolean {
    if (!embed.url) {
        return false;
    }
    const spoileredUrlRegex = new RegExp(
        `${escapeRegex('||')}\\s+${escapeRegex(embed.url)}\\s+${escapeRegex(
            '||',
        )}`,
    );
    return spoileredUrlRegex.test(message.content);
}

async function getEmbedsAsComponent(
    message: Message | MessageSnapshot,
): Promise<MediaGalleryBuilder | null> {
    const embedsWithAttachments = (
        await Promise.all(
            message.embeds.map(
                async (embed: Embed): Promise<[Embed, string | null]> => [
                    embed,
                    await getEmbedImageUrl(embed),
                ],
            ),
        )
    ).filter(([, url]) => url);
    return createMediaGalleryFromIterable(
        embedsWithAttachments,
        ([embed], index) => {
            const baseDescription = `Starred embed attachment number ${
                index + 1
            } of ${embedsWithAttachments}`;
            return embed.description
                ? `${baseDescription}. Original description: ${embed.description}`
                : baseDescription;
        },
        async ([, url]) => url!,
        ([embed]) => isEmbedSpoilered(message, embed),
    );
}

async function getMessageStickersAsComponent(
    message: Message | MessageSnapshot,
): Promise<MediaGalleryBuilder | null> {
    return createMediaGalleryFromIterable(
        message.stickers.values(),
        (sticker, index) => {
            const baseDescription = `Starred visual message attachment number ${
                index + 1
            } of ${message.stickers.size}`;
            return sticker.description
                ? `${baseDescription}. Original description: ${sticker.description}`
                : baseDescription;
        },
        async (sticker) => sticker.url,
        () => false,
    );
}

export async function generateBasicStarboardMessageComponent(
    message: Message,
    footerText?: string,
    additionalButtons?: ButtonBuilder[],
): Promise<ContainerBuilder> {
    const contentSourceMessage = getMessageSnapshot(message) ?? message;

    const createdAtTimestamp = Math.floor(message.createdTimestamp / 1000);
    const footerTimestamp = `<t:${createdAtTimestamp}:d> (<t:${createdAtTimestamp}:R>)`;
    const footer = footerText
        ? `-# ${footerText} • ${footerTimestamp}`
        : footerTimestamp;
    const jumpToMessageButton = new ButtonBuilder()
        .setLabel('Jump to Message')
        .setStyle(ButtonStyle.Link)
        .setURL(message.url);
    const buttons = additionalButtons
        ? [jumpToMessageButton, ...additionalButtons]
        : [jumpToMessageButton];

    let builder = new ContainerBuilder()
        .setAccentColor(STARBOARD_EMBED_COLOR)
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder({ content: '# Starred Message' }),
                    new TextDisplayBuilder({
                        content: `**Author: ${message.author}**`,
                    }),
                    new TextDisplayBuilder({
                        content: `**Channel: ${message.channel}**`,
                    }),
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder({
                        description: `${message.author.username}'s avatar`,
                        media: { url: message.author.displayAvatarURL() },
                    }),
                ),
        )
        .addSeparatorComponents(
            new SeparatorBuilder({
                spacing: SeparatorSpacingSize.Small,
                divider: true,
            }),
        );
    if (
        contentSourceMessage.content &&
        !isMessageNoContentEmbed(contentSourceMessage)
    ) {
        const originalContent = contentSourceMessage.content;
        const content =
            originalContent.length >= MESSAGE_CONTENT_MAX_LENGTH
                ? originalContent.slice(0, MESSAGE_CONTENT_MAX_LENGTH) + '...'
                : originalContent;
        builder = builder.addTextDisplayComponents(
            new TextDisplayBuilder({ content: content }),
        );
    }
    const messageAttachments = await getMessageVisualAttachmentsAsComponent(
        contentSourceMessage,
    );
    if (messageAttachments) {
        builder = builder.addMediaGalleryComponents(messageAttachments);
    }
    const embeds = await getEmbedsAsComponent(contentSourceMessage);
    if (embeds) {
        builder = builder.addMediaGalleryComponents(embeds);
    }
    const stickers = await getMessageStickersAsComponent(contentSourceMessage);
    if (stickers) {
        builder = builder.addMediaGalleryComponents(stickers);
    }
    return builder
        .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>({
                components: buttons,
            }),
        )
        .addTextDisplayComponents(new TextDisplayBuilder({ content: footer }));
}

export async function generateStarboardMessageComponentForGuildStarboard(
    reaction: MessageReaction,
): Promise<ContainerBuilder> {
    let footer = '';
    if (!reaction.emoji.id) {
        footer = `${reaction.emoji.name} ${reaction.count} ${
            reaction.emoji.name === DEFAULT_STARBOARD_EMOJI ? 'stars' : ''
        }`;
    } else if (reaction.emoji.name) {
        footer = `${reaction.emoji} ${
            reaction.count
        } ${reaction.emoji.name.toLowerCase()}`;
    }
    return generateBasicStarboardMessageComponent(
        await reaction.message.fetch(),
        footer,
    );
}

export async function generateStarboardmessageComponentForPrivateStarboard(
    message: Message,
): Promise<ContainerBuilder> {
    return generateBasicStarboardMessageComponent(message, undefined, [
        new ButtonBuilder()
            .setCustomId('private_starboard_DELETE')
            .setLabel('Delete Message')
            .setStyle(ButtonStyle.Danger),
    ]);
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
