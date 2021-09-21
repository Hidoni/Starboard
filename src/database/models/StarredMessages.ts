import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';
import { StarredMessageInstance } from '../../interfaces/StarredMessages';

export const initialize: DatabaseModelInitializer<StarredMessageInstance> = (
    sequelize: Sequelize
) => {
    return sequelize.define(
        'starred_messages',
        {
            messageId: {
                type: DataTypes.STRING,
                allowNull: false,
                primaryKey: true,
            },
            guildId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            userId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            starboardMessageId: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            starCount: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: false,
            indexes: [
                {
                    fields: ['guild_id', 'user_id'],
                },
            ],
        }
    );
};
