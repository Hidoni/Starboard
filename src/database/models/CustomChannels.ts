import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';
import { CustomChannelInstance } from '../../interfaces/CustomChannels';

export const initialize: DatabaseModelInitializer<CustomChannelInstance> = (sequelize: Sequelize) => {
    return sequelize.define(
        'custom_starboard_channels',
        {
            channelId: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            starboardId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
        }
    );
};
