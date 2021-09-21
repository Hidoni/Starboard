import { Logger } from 'log4js';
import { Client, Intents, Collection } from 'discord.js';
import { BotConfig } from '../interfaces/BotConfig';
import { Command } from '../interfaces/Command';
import { Event } from '../interfaces/Event';
import path from 'path';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import glob from 'glob';
import Database from '../database/DatabaseObject';

class Bot extends Client {
    public logger?: Logger;
    public database: Database;
    private commands: Collection<string, Command> = new Collection();
    private restAPI: REST;
    private config: BotConfig;

    public constructor(config: BotConfig, logger?: Logger) {
        super({ intents: config.intents, partials: config.partials });
        this.config = config;
        this.logger = logger;
        this.database = config.database
        this.restAPI = new REST({ version: '9' }).setToken(config.token);

        if (config.commandsFolder) {
            this.loadCommands(config.commandsFolder);
        }
        if (config.eventsFolder) {
            this.loadEvents(config.eventsFolder);
        }
    }

    private loadCommands(folder: string) {
        try {
            glob.sync(path.join(folder, '**/*.js')).forEach((file: string) => {
                const handler: Command = require(file);
                this.commands.set(handler.builder.name, handler);
            });
        } catch (error) {
            this.logger?.error(`Failed to load commands: ${error}`);
        }
    }

    private loadEvents(folder: string) {
        try {
            glob.sync(path.join(folder, '**/*.js')).forEach((file: string) => {
                const handler: Event = require(file);
                this.registerEvent(handler.name, handler);
            });
        } catch (error) {
            this.logger?.error(`Failed to load events: ${error}`);
        }
    }

    public getCommand(commandName: string): Command | undefined {
        return this.commands.get(commandName);
    }

    public async run() {
        this.login(this.config.token);
        await this.registerCommands();
    }

    private registerEvent(eventName: string, event: Event): void {
        if (event.once) {
            this.once(eventName, event.handler.bind(null, this));
        } else {
            this.on(eventName, event.handler.bind(null, this));
        }
        this.logger?.info(
            `Registered event ${eventName} (once=${!!event.once})`
        );
    }

    private async registerCommands(): Promise<void> {
        let route = this.config.debugGuildId
            ? Routes.applicationGuildCommands(
                  this.config.appId,
                  this.config.debugGuildId
              )
            : Routes.applicationCommands(this.config.appId);
        try {
            const commandsJSON = this.commands.map((command) =>
                command.builder.toJSON()
            );
            await this.restAPI.put(route, { body: commandsJSON });
            this.logger?.info(
                `Succesfully registered ${commandsJSON.length} commands`
            );
        } catch (error) {
            this.logger?.error(`Error loading commands: ${error}`);
        }
    }
}

export { Bot };
