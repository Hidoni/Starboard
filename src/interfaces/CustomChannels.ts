import { Model } from "sequelize/types";

export interface CustomChannelInstance extends Model {
    channelId: string;
    starboardId: string;
}
