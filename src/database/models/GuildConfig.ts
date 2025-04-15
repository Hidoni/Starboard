import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';
import { GuildConfigInstance } from '../../interfaces/GuildConfig';

export const initialize: DatabaseModelInitializer<GuildConfigInstance> = (
    sequelize: Sequelize,
) => {
    return sequelize.define(
        'guild_config',
        {
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            sfwChannelId: {
                type: DataTypes.STRING,
            },
            nsfwChannelId: {
                type: DataTypes.STRING,
            },
            emoji: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: '\u2b50',
            },
            isUnicode: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            minimumReacts: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 5,
            },
        },
        {
            timestamps: false,
        },
    );
};
