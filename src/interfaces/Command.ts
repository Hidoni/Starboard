import { SlashCommandBuilder } from '@discordjs/builders';
import { Interaction } from 'discord.js';
import { Bot } from '../client/Client';
import { Handler } from './Handler';

export interface CommandHandler {
    (client: Bot, interaction: Interaction): Promise<void>;
}

export interface Command extends Handler {
    handler: CommandHandler;
    builder: SlashCommandBuilder;
}
