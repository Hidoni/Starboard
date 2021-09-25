import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Interaction, PermissionResolvable, PermissionString } from 'discord.js';
import { Bot } from '../client/Client';

export interface CommandHandler {
    (client: Bot, interaction: CommandInteraction): Promise<void>;
}

export interface Command {
    handler: CommandHandler;
    builder: SlashCommandBuilder;
    guildOnly: boolean | undefined;
    permissions: PermissionString[] | undefined;
}
