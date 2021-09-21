import { Snowflake } from "discord.js";
import { Model } from "sequelize/types";

export interface GuildConfigInstance extends Model {
    guildId: Snowflake;
    sfwChannelId: Snowflake;
    nsfwChannelId: Snowflake;
    emoji: Snowflake | string;
    isUnicode: boolean;
    minimumReacts: number;
}
