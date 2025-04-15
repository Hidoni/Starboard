import { ChatInputCommandInteraction, ContextMenuCommandBuilder, ContextMenuCommandInteraction, PermissionResolvable, SlashCommandBuilder } from 'discord.js';
import { Bot } from '../client/Client';

export interface ChatInputCommandHandler {
    (client: Bot, interaction: ChatInputCommandInteraction): Promise<void>;
}
export interface ContextMenuCommandHandler {
    (client: Bot, interaction: ContextMenuCommandInteraction): Promise<void>;
}

export interface Command<Builder extends SlashCommandBuilder | ContextMenuCommandBuilder> {
    handler: Builder extends SlashCommandBuilder ? ChatInputCommandHandler : ContextMenuCommandHandler;
    builder: Builder;
    guildOnly: boolean | undefined;
    permissions: PermissionResolvable[] | undefined;
}
