import { Interaction } from 'discord.js';
import { Bot } from '../client/Client';
import { EventHandler } from '../interfaces/Event';

export const name: string = 'interactionCreate';
export const handler: EventHandler = async (
    client: Bot,
    interaction: Interaction
) => {
    if (interaction.isCommand()) {
        const command = client.getCommand(interaction.commandName);
        if (command) {
            await command.handler(client, interaction);
        } else {
            client.logger?.debug(
                `Ignoring unknown command with name ${interaction.commandName}`
            );
        }
    } else {
        client.logger?.debug(
            `Ignoring unknown interaction: ${interaction.toJSON()}`
        );
    }
};
