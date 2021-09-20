import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';

export const initializer: DatabaseModelInitializer = (sequelize: Sequelize) => {
    return sequelize.define(
        'starred_messages',
        {
            message_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            guild_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            starboard_message_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            star_count: {
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
