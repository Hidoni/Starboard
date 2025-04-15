import { ComponentHandlerFunction } from '../interfaces/ComponentHandler';

export const handler: ComponentHandlerFunction = async (
    _client,
    interaction
) => {
    await interaction.message.delete()
};

export const pattern: RegExp = /^private_starboard_DELETE$/;
