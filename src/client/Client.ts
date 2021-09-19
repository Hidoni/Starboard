import { Logger } from 'log4js';
import { Client, Intents, Collection } from 'discord.js';
import { BotConfig } from '../interfaces/BotConfig';
import { Command } from '../interfaces/Command';
import { Event } from '../interfaces/Event';
import * as fs from 'fs';
import * as Path from 'path';
import { Handler } from '../interfaces/Handler';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

class Bot extends Client {
    public logger?: Logger;
    private commands: Collection<string, Command> = new Collection();
    private events: Collection<string, Event> = new Collection();
    private restAPI: REST;
    private config: BotConfig;

    public constructor(config: BotConfig, logger?: Logger) {
        super({ intents: config.intents });
        this.config = config;
        this.logger = logger;
        this.restAPI = new REST({ version: '9' }).setToken(config.token);

        if (config.commandsFolder) {
            this.loadHandlers(config.commandsFolder, this.commands);
        }
        if (config.eventsFolder) {
            this.loadHandlers(config.eventsFolder, this.events);
        }
    }

    private loadHandlers<Type extends Handler>(
        folder: string,
        collection: Collection<string, Type>
    ) {
        const handlerFiles = fs
            .readdirSync(folder)
            .filter((file) => file.endsWith('.js'));
        handlerFiles.map(async (file: string) => {
            const handler: Type = await import(Path.join(folder, file));
            collection.set(handler.name, handler);
        });
    }

    public getCommand(commandName: string): Command | undefined {
        return this.commands.get(commandName);
    }

    public async run() {
        for (const { 0: eventName, 1: event } of this.events) {
            if (event.once) {
                this.once(eventName, event.handler.bind(null, this));
            } else {
                this.on(eventName, event.handler.bind(null, this));
            }
        }
        this.login(this.config.token);
        await this.registerCommands();
    }

    private async registerCommands(): Promise<void> {
        let route = this.config.debugGuildId
            ? Routes.applicationGuildCommands(
                  this.config.appId,
                  this.config.debugGuildId
              )
            : Routes.applicationCommands(this.config.appId);
        try {
            await this.restAPI.put(route, {
                body: this.commands.map((command) => command.builder.toJSON()),
            });
        } catch (error) {
            this.logger?.error(`Error loading commands: ${error}`);
        }
    }
}

export { Bot };
