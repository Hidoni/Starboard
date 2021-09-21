import { Model } from "sequelize/types";

export interface StarredMessageInstance extends Model {
    messageId: string;
    guildId: string;
    userId: string;
    starboardMessageId: string;
    starCount: number;
}
