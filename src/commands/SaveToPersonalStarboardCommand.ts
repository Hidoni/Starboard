import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    MessageFlags,
} from 'discord.js';
import { Bot } from '../client/Client';
import { ContextMenuCommandHandler } from '../interfaces/Command';
import {
    generateStarboardmessageComponentForPrivateStarboard,
} from '../utils/StarboardUtils';

export const handler: ContextMenuCommandHandler = async (
    client: Bot,
    interaction: ContextMenuCommandInteraction,
) => {
    const message = await interaction.channel?.messages.fetch(
        interaction.targetId!,
    );
    if (!message) {
        throw new Error(
            `Could not fetch message with id ${interaction.targetId}`,
        );
    }
    interaction.user.send({
        components: [
            await generateStarboardmessageComponentForPrivateStarboard(message),
        ],
        flags: MessageFlags.IsComponentsV2,
    });
    interaction.reply({
        content:
            'Message saved to personal starboard succesfully, check your DMs!',
        flags: MessageFlags.Ephemeral,
    });
};
export const builder = new ContextMenuCommandBuilder()
    .setName('Save To Personal Starboard')
    .setType(ApplicationCommandType.Message);
export const guildOnly: boolean = true;
