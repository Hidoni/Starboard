import { Model } from "sequelize/types";

export interface GuildConfigInstance extends Model {
    guildId: string;
    sfwChannelId: string;
    nsfwChannelId: string;
    emoji: string;
    isUnicode: boolean;
    minimumReacts: number;
}
