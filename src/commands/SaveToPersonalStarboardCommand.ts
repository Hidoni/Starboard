import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ContextMenuCommandBuilder, ContextMenuCommandInteraction } from 'discord.js';
import { Bot } from '../client/Client';
import { ContextMenuCommandHandler } from '../interfaces/Command';
import { generateBasicStarboardEmbed } from '../utils/StarboardUtils';

export const handler: ContextMenuCommandHandler = async (
    client: Bot,
    interaction: ContextMenuCommandInteraction
) => {
    const message = await interaction.channel?.messages.fetch(
        interaction.targetId!
    );
    if (!message) {
        throw new Error(
            `Could not fetch message with id ${interaction.targetId}`
        );
    }
    const embed = generateBasicStarboardEmbed(message);
    const deleteButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('private_starboard_DELETE')
            .setLabel('Delete Message')
            .setStyle(ButtonStyle.Danger)
    );
    interaction.user.send({ embeds: [embed], components: [deleteButtonRow]});
    interaction.reply({
        content:
            'Message saved to personal starboard succesfully, check your DMs!',
        ephemeral: true,
    });
};
export const builder = new ContextMenuCommandBuilder()
    .setName('Save To Personal Starboard')
    .setType(ApplicationCommandType.Message);
export const guildOnly: boolean = true;
