import { Sequelize } from 'sequelize/types';
import { DataTypes } from 'sequelize';
import { DatabaseModelInitializer } from '../../interfaces/DatabaseModel';

export const initializer: DatabaseModelInitializer = (sequelize: Sequelize) => {
    return sequelize.define(
        'custom_starboard_channels',
        {
            channel_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },
            starboard_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            timestamps: false,
        }
    );
};
