import { ContextMenuCommandBuilder, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, ContextMenuInteraction, PermissionString } from 'discord.js';
import { Bot } from '../client/Client';

export interface CommandHandler {
    (client: Bot, interaction: CommandInteraction): Promise<void>;
}
export interface ContextMenuHandler {
    (client: Bot, interaction: ContextMenuInteraction): Promise<void>;
}

export interface Command<Builder extends SlashCommandBuilder | ContextMenuCommandBuilder> {
    handler: Builder extends SlashCommandBuilder ? CommandHandler : ContextMenuHandler;
    builder: Builder;
    guildOnly: boolean | undefined;
    permissions: PermissionString[] | undefined;
}
