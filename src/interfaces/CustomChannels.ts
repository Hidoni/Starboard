import { Snowflake } from 'discord.js';
import { Model } from 'sequelize/types';

export interface CustomChannelInstance extends Model {
    channelId: Snowflake;
    starboardId: Snowflake;
    guildId: Snowflake;
}
