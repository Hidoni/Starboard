import { Snowflake } from "discord.js";
import { Model } from "sequelize/types";

export interface StarredMessageInstance extends Model {
    messageId: Snowflake;
    guildId: Snowflake;
    userId: Snowflake;
    starboardMessageId: Snowflake;
    starCount: number;
}
