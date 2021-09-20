import { initialize as initializeStarredMessages } from './models/StarredMessages';
import { initialize as initializeGuildConfig } from './models/GuildConfig';
import { initialize as initializeCustomChannels } from './models/CustomChannels';
import { Model, ModelCtor } from 'sequelize/types';
import { Sequelize } from 'sequelize';
import { Logger } from 'log4js';

class Database {
    private sequelize: Sequelize;
    public starredMessages: ModelCtor<Model<any, any>>;
    public serverConfig: ModelCtor<Model<any, any>>;
    public CustomChannels: ModelCtor<Model<any, any>>;

    public constructor(database_path: string, logger?: Logger) {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: database_path,
            logging: logger?.debug.bind(logger),
        });
        this.starredMessages = initializeStarredMessages(this.sequelize);
        this.serverConfig = initializeGuildConfig(this.sequelize);
        this.CustomChannels = initializeCustomChannels(this.sequelize);
    }

    public sync(): void {
        this.sequelize.sync();
    }
}

export default Database;
