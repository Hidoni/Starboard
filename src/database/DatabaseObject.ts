import { initialize as initializeStarredMessages } from './models/StarredMessages';
import { initialize as initializeGuildConfig } from './models/GuildConfig';
import { initialize as initializeCustomChannels } from './models/CustomChannels';
import { Model, ModelCtor } from 'sequelize/types';
import { Sequelize } from 'sequelize';
import { Logger } from 'log4js';
import { GuildConfigInstance } from '../interfaces/GuildConfig';
import { StarredMessageInstance } from '../interfaces/StarredMessages';
import { CustomChannelInstance } from '../interfaces/CustomChannels';
import { Snowflake } from 'discord.js';

class Database {
    private sequelize: Sequelize;
    private starredMessages: ModelCtor<StarredMessageInstance>;
    private guildConfig: ModelCtor<GuildConfigInstance>;
    private customChannels: ModelCtor<CustomChannelInstance>;

    public constructor(database_path: string, logger?: Logger) {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: database_path,
            logging: logger?.debug.bind(logger),
        });
        this.starredMessages = initializeStarredMessages(this.sequelize);
        this.guildConfig = initializeGuildConfig(this.sequelize);
        this.customChannels = initializeCustomChannels(this.sequelize);
    }

    public sync(): void {
        this.sequelize.sync();
    }

    public async getGuildConfig(
        guildId: Snowflake
    ): Promise<GuildConfigInstance> {
        let result = await this.guildConfig.findOne({
            where: { guildId: guildId },
        });
        if (!result) {
            result = await this.guildConfig.create({ guildId: guildId });
        }
        return result;
    }

    public async getCustomChannel(
        channelId: Snowflake
    ): Promise<CustomChannelInstance | null> {
        return await this.customChannels.findOne({
            where: { channelId: channelId },
        });
    }

    public async getStarredMessage(
        messageId: Snowflake
    ): Promise<StarredMessageInstance | null> {
        return await this.starredMessages.findOne({
            where: { messageId: messageId },
        });
    }
}

export default Database;
