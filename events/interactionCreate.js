const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		interaction.client.jejudo.handleInteraction(interaction);
		if (interaction.isStringSelectMenu()) {
			const values = interaction.values[0];
			if (interaction.customId === 'showLevel' && values.split('_')[1] === interaction.user.id) {
				const handler = require('../handlers/showlevel');
				handler.execute(interaction);
			}
		}

		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};