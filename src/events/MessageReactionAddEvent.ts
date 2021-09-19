import { MessageReaction, PartialMessageReaction, User } from 'discord.js';
import { Bot } from '../client/Client';
import { EventHandler } from '../interfaces/Event';

export const name: string = 'messageReactionAdd';
export const handler: EventHandler = async (
    client: Bot,
    reaction: MessageReaction | PartialMessageReaction,
    user: User
) => {
    if (reaction.partial) {
        reaction = await reaction.fetch();
    }
    if (reaction.message.author == user) {
        await reaction.users.remove(user);
    }
};
