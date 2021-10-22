import { CommandInteraction, Interaction } from 'discord.js';
import { Bot } from '../client/Client';
import { Command } from '../interfaces/Command';
import { EventHandler } from '../interfaces/Event';
import { hasPermissions } from '../utils/StarboardUtils';

async function canRunCommand(
    client: Bot,
    interaction: CommandInteraction,
    command: Command
): Promise<boolean> {
    if (command.guildOnly && !interaction.guild) {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true,
        });
        return false;
    } else if (command.permissions) {
        if (!interaction.member) {
            await interaction.reply({
                content: 'An error has occured during handling of the command',
                ephemeral: true,
            });
            client.logger?.error(
                `member field was null, could not perform required permission check in command ${interaction.commandName}`
            );
            return false;
        } else if (!hasPermissions(interaction.member, command.permissions)) {
            await interaction.reply({
                content: `You must have the following permissions to use this command: ${command.permissions.join(
                    ', '
                )}`,
                ephemeral: true,
            });
            return false;
        }
    }
    return true;
}

export const name: string = 'interactionCreate';
export const handler: EventHandler = async (
    client: Bot,
    interaction: Interaction
) => {
    if (interaction.isCommand()) {
        const command = client.getCommand(interaction.commandName);
        if (command) {
            if (await canRunCommand(client, interaction, command)) {
                command.handler(client, interaction).catch((error) => {
                    client.logger?.error(
                        `Got the following error while executing ${interaction.commandName} command: ${error}`
                    );
                    if (!interaction.replied) {
                        interaction.reply({
                            content:
                                'An unknown error has occured and has been logged, please contact the developer to report this.',
                            ephemeral: true,
                        });
                    }
                });
            }
        } else {
            client.logger?.debug(
                `Ignoring unknown command with name ${interaction.commandName}`
            );
        }
    } else {
        client.logger?.debug(
            `Ignoring unknown interaction of type: ${interaction.type}`
        );
    }
};
