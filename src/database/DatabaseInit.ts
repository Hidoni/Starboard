import { Sequelize } from 'sequelize';
import { initialize as initializeStarredMessages } from './models/StarredMessages';
import { initialize as initializeServerConfig } from './models/ServerConfig';
import { initialize as initializeCustomChannels } from './models/CustomChannels';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'starboard.sqlite',
});

initializeStarredMessages(sequelize);
initializeServerConfig(sequelize);
initializeCustomChannels(sequelize);

sequelize.sync();
