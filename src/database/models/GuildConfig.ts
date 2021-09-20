import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';

export const initialize: DatabaseModelInitializer = (sequelize: Sequelize) => {
    return sequelize.define(
        'guild_config',
        {
            guild_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            sfw_channel_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            nsfw_channel_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            emoji: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '\u2b50',
            },
            is_unicode: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            minimum_reactions: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5,
            },
        },
        {
            timestamps: false,
        }
    );
};
