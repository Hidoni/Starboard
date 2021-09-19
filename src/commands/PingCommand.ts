import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction } from 'discord.js';
import { Bot } from '../client/Client';
import { CommandHandler } from '../interfaces/Command';

export const name: string = 'ping';
export const handler: CommandHandler = async (
    client: Bot,
    interaction: CommandInteraction
) => {
    await interaction.reply(`Pong! (${client.ws.ping}MS)`);
};
export const builder: SlashCommandBuilder = new SlashCommandBuilder()
    .setName(name)
    .setDescription('Shows bot delay time');
