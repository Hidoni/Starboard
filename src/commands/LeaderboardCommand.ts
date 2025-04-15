import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../client/Client';
import { ChatInputCommandHandler } from '../interfaces/Command';
import {
    generateLeaderboardComponentsRow,
    generateLeaderboardEmbed,
} from '../utils/StarboardUtils';

export const handler: ChatInputCommandHandler = async (
    client: Bot,
    interaction: ChatInputCommandInteraction
) => {
    const userStars = await client.database.getStarredMessagesInGuildByUsers(
        interaction.guildId!
    );
    const leaderboardEmbed = generateLeaderboardEmbed(userStars, 1);
    const pageControlRow = generateLeaderboardComponentsRow(userStars, 1);
    interaction.reply({
        embeds: [leaderboardEmbed],
        components: [pageControlRow],
    });
};
export const builder = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription("View the server's starboard leaderboard");
export const guildOnly: boolean = true;
