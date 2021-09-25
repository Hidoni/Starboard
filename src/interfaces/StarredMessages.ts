import { Snowflake } from "discord.js";
import { Model } from "sequelize/types";

export interface StarredMessageInstance extends Model {
    messageId: Snowflake;
    guildId: Snowflake;
    userId: Snowflake | null;
    starboardMessageId: Snowflake;
    starCount: number;
}
